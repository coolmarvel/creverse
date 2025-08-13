import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';
import { extname } from 'path';

import { boldHighlights } from '../utils';
import { CreateSubmissionDto } from '../dtos';
import { SubmissionStatus } from '../constants';
import { Student } from '../../students/entities';
import { Submission, SubmissionLog, SubmissionMedia } from '../entities';

import { AiService } from './ai.service';
import { BlobService } from './blob.service';
import { FFmpegService } from './ffmpeg.service';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission) private readonly subRepo: Repository<Submission>,
    @InjectRepository(SubmissionLog) private readonly logRepo: Repository<SubmissionLog>,
    @InjectRepository(SubmissionMedia) private readonly mediaRepo: Repository<SubmissionMedia>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    private readonly ffmpeg: FFmpegService,
    private readonly blob: BlobService,
    private readonly ai: AiService,
  ) {}

  async create(dto: CreateSubmissionDto, file?: Express.Multer.File, traceId?: string) {
    const startedAll = Date.now();
    const exists = await this.subRepo.findOne({ where: { studentId: String(dto.studentId), componentType: dto.componentType } });
    if (exists) throw new BadRequestException('already requested for this component');

    // 학생 upsert (externalStudentId = dto.studentId)
    let student = await this.studentRepo.findOne({ where: { externalStudentId: String(dto.studentId) } });
    if (!student) {
      student = await this.studentRepo.save(this.studentRepo.create({ externalStudentId: String(dto.studentId), studentName: dto.studentName }));
    } else if (student.studentName !== dto.studentName) {
      // 이름 갱신 정도는 허용 (요구사항 명시 X, 품질 향상 목적)
      student.studentName = dto.studentName;
      await this.studentRepo.save(student);
    }

    const submission = await this.subRepo.save(
      this.subRepo.create({
        studentId: String(dto.studentId),
        componentType: dto.componentType,
        submitText: dto.submitText,
        traceId: traceId || null,
        student,
      }),
    );

    let mediaUrl: { video: string; audio: string } | null = null;

    try {
      // 파일 전처리
      if (file) {
        if (!file.buffer || file.size === 0) {
          throw new Error('uploaded file buffer is empty');
        }
        const tmpPath = `/tmp/${randomUUID()}${extname(file.originalname) || '.mp4'}`;
        writeFileSync(tmpPath, file.buffer);

        const t0Pre = Date.now();
        const { videoPath, audioPath } = await this.ffmpeg.preprocess(tmpPath, /*cropRightPx*/ 300);
        const preMs = Date.now() - t0Pre;

        // 전처리 로그
        await this.logRepo.save(
          this.logRepo.create({
            submissionId: submission.submissionId,
            step: 'FFmpeg_PREPROCESS',
            status: 'ok' as any,
            requestPayload: { cropRightPx: 300, fileName: file.originalname, fileSize: file.size },
            responsePayload: { videoPath, audioPath },
            latencyMs: preMs,
            traceId: traceId || submission.traceId,
          }),
        );

        // 업로드
        const base = submission.submissionId;
        try {
          const t0Blob = Date.now();
          const videoUrl = await this.blob.uploadFile(videoPath, `${base}.mp4`);
          const audioUrl = await this.blob.uploadFile(audioPath, `${base}.mp3`);
          mediaUrl = { video: videoUrl, audio: audioUrl };
          console.log('mediaUrl', mediaUrl);

          await this.mediaRepo.save(this.mediaRepo.create({ submissionId: submission.submissionId, videoUrl, audioUrl }));
          await this.logRepo.save(
            this.logRepo.create({
              submissionId: submission.submissionId,
              step: 'BLOB_UPLOAD_OK',
              externalService: 'AZURE_BLOB' as any,
              status: 'ok' as any,
              requestPayload: { container: 'video/audio', blobBase: base },
              responsePayload: { mediaUrl },
              latencyMs: Date.now() - t0Blob,
              traceId: traceId || submission.traceId,
            }),
          );
        } catch (err) {
          await this.logRepo.save(
            this.logRepo.create({
              submissionId: submission.submissionId,
              step: 'BLOB_UPLOAD_FAILED',
              externalService: 'AZURE_BLOB' as any,
              status: 'failed' as any,
              responsePayload: { error: String(err) },
              httpStatus: err?.statusCode ?? null,
              traceId: traceId || submission.traceId,
            }),
          );
          throw err;
        }
      }

      // (전처리 로그는 파일 업로드 블록에서 처리)

      const aiStarted = Date.now();
      const evalRes = await this.ai.evaluateEssay(dto.submitText, dto.componentType);

      // 하이라이트 태깅
      const highlightSubmitText = boldHighlights(dto.submitText, evalRes.highlights);

      // DB 반영
      submission.score = evalRes.score;
      submission.feedback = evalRes.feedback;
      submission.highlights = evalRes.highlights as any;
      submission.highlightSubmitText = highlightSubmitText;
      submission.status = SubmissionStatus.SUCCESS;
      submission.apiLatencyMs = Date.now() - aiStarted; // 전체 지표면 Date.now()-started 써도 OK
      await this.subRepo.save(submission);

      await this.logRepo.save(
        this.logRepo.create({
          submissionId: submission.submissionId,
          step: 'AI_CALL',
          externalService: 'AZURE_OPENAI' as any,
          status: 'ok' as any,
          requestPayload: { componentType: dto.componentType, textLength: dto.submitText?.length ?? 0 },
          responsePayload: { score: evalRes.score, highlightsCount: evalRes.highlights.length },
          latencyMs: Date.now() - aiStarted,
          traceId: traceId || submission.traceId,
        }),
      );

      return {
        submissionId: submission.submissionId,
        studentId: dto.studentId,
        studentName: dto.studentName,
        score: evalRes.score,
        feedback: evalRes.feedback,
        highlights: evalRes.highlights,
        submitText: dto.submitText,
        highlightSubmitText,
        mediaUrl: mediaUrl ?? null,
      };
    } catch (e) {
      // 에러 원인 보조 확인용: 업로드/AI 어디서 실패했는지 로그에 남김
      // 실제 응답 스키마는 전역 필터/인터셉터에서 통일되므로 여기서는 상태 저장과 단계 로그에 집중
      submission.status = SubmissionStatus.FAILED;
      submission.message = 'evaluation failed';
      await this.subRepo.save(submission);

      await this.logRepo.save(
        this.logRepo.create({
          submissionId: submission.submissionId,
          step: 'EVAL_FAILED',
          status: 'failed' as any,
          responsePayload: { error: String(e) },
          httpStatus: e?.statusCode ?? null,
          latencyMs: Date.now() - startedAll,
          traceId: traceId || submission.traceId,
        }),
      );

      throw new BadRequestException('submission processing failed');
    }
  }

  async findAll(params: { page: number; size: number; status?: string; studentId?: number; studentName?: string; include?: string; sort?: string }) {
    const { page, size, status, studentId, studentName, include, sort } = params;

    const qb = this.subRepo.createQueryBuilder('s').leftJoinAndSelect('s.student', 'st');

    if (status) qb.andWhere('s.status = :status', { status });
    if (studentId) qb.andWhere('s.studentId = :studentId', { studentId });
    if (studentName) qb.andWhere('st.studentName ILIKE :nm', { nm: `%${studentName}%` });

    // include=media,logs,revisions
    const includes = (include || '').split(',').map((v) => v.trim().toLowerCase());
    if (includes.includes('media')) qb.leftJoinAndSelect('s.media', 'media');
    if (includes.includes('logs')) qb.leftJoinAndSelect('s.logs', 'logs');
    if (includes.includes('revisions')) qb.leftJoinAndSelect('s.revisions', 'revisions');

    // sort handling
    const [sortField, sortDirRaw] = (sort || 'createdAt,DESC').split(',');
    const sortDir = (sortDirRaw || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sortColumn = ['createdAt', 'score', 'status'].includes(sortField) ? `s.${sortField}` : 's.createdAt';
    qb.orderBy(sortColumn, sortDir as any)
      .skip((page - 1) * size)
      .take(size);

    const [items, total] = await qb.getManyAndCount();
    return { page, size, total, items };
  }

  async findOne(id: string) {
    const found = await this.subRepo.findOne({
      where: { submissionId: id },
      relations: { media: true, logs: true, revisions: true },
    });

    if (!found) throw new BadRequestException('submission not found');
    return found;
  }
}
