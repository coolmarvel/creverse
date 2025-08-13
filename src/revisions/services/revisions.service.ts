import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Revision } from '../entities';
import { ReEvaluateDto } from '../dtos';
import { RevisionStatus } from '../constants';
import { Submission, SubmissionLog } from '../../submissions/entities';
import { SubmissionStatus } from '../../submissions/constants';
import { AiService } from '../../submissions/services/ai.service';
import { boldHighlights } from '../../submissions/utils';

@Injectable()
export class RevisionsService {
  constructor(
    @InjectRepository(Revision) private readonly revRepo: Repository<Revision>,
    @InjectRepository(Submission) private readonly subRepo: Repository<Submission>,
    @InjectRepository(SubmissionLog) private readonly logRepo: Repository<SubmissionLog>,
    private readonly ai: AiService,
  ) {}

  async request(dto: ReEvaluateDto) {
    const sub = await this.subRepo.findOne({ where: { submissionId: dto.submissionId } });
    if (!sub) throw new BadRequestException('submission not found');

    // 상태 갱신 + 리비전 생성
    sub.status = SubmissionStatus.PROCESSING;
    await this.subRepo.save(sub);

    const rev = await this.revRepo.save(
      this.revRepo.create({
        submissionId: sub.submissionId,
        status: RevisionStatus.PENDING,
        reason: 'manual re-evaluation',
      }),
    );

    await this.logRepo.save(
      this.logRepo.create({
        submissionId: sub.submissionId,
        step: 'REVISION_REQUESTED',
        status: 'ok' as any,
        responsePayload: { revisionId: rev.revisionId },
        traceId: sub.traceId,
      }),
    );

    try {
      const started = Date.now();
      const evalRes = await this.ai.evaluateEssay(sub.submitText, sub.componentType);
      const highlightSubmitText = boldHighlights(sub.submitText, evalRes.highlights);

      // 제출/리비전 업데이트
      sub.score = evalRes.score;
      sub.feedback = evalRes.feedback;
      sub.highlights = evalRes.highlights as any;
      sub.highlightSubmitText = highlightSubmitText;
      sub.status = SubmissionStatus.SUCCESS;
      sub.apiLatencyMs = Date.now() - started;
      await this.subRepo.save(sub);

      rev.status = RevisionStatus.SUCCESS;
      rev.score = evalRes.score;
      rev.feedback = evalRes.feedback;
      rev.highlights = evalRes.highlights as any;
      rev.apiLatencyMs = sub.apiLatencyMs;
      await this.revRepo.save(rev);

      await this.logRepo.save(
        this.logRepo.create({
          submissionId: sub.submissionId,
          step: 'REVISION_AI_CALL',
          externalService: 'AZURE_OPENAI' as any,
          status: 'ok' as any,
          requestPayload: { componentType: sub.componentType, textLength: sub.submitText?.length ?? 0 },
          responsePayload: { score: evalRes.score, highlightsCount: evalRes.highlights.length, revisionId: rev.revisionId },
          latencyMs: Date.now() - started,
          traceId: sub.traceId,
        }),
      );

      return { revisionId: rev.revisionId };
    } catch (e) {
      sub.status = SubmissionStatus.FAILED;
      sub.message = 're-evaluation failed';
      await this.subRepo.save(sub);

      rev.status = RevisionStatus.FAILED;
      await this.revRepo.save(rev);

      await this.logRepo.save(
        this.logRepo.create({
          submissionId: sub.submissionId,
          step: 'REVISION_FAILED',
          status: 'failed' as any,
          responsePayload: { error: String(e), revisionId: rev.revisionId },
          traceId: sub.traceId,
        }),
      );

      throw new BadRequestException('revision processing failed');
    }
  }

  async list(page: number, size: number) {
    const [items, total] = await this.revRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { page, size, total, items };
  }

  async detail(id: string) {
    const found = await this.revRepo.findOne({ where: { revisionId: id }, relations: ['submission'] });
    if (!found) throw new BadRequestException('revision not found');
    return found;
  }
}
