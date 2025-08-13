import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SubmissionsService } from '../src/submissions/services/submissions.service';
import { Submission, SubmissionLog, SubmissionMedia } from '../src/submissions/entities';
import { FFmpegService } from '../src/submissions/services/ffmpeg.service';
import { BlobService } from '../src/submissions/services/blob.service';
import { AiService } from '../src/submissions/services/ai.service';
import { CreateSubmissionDto } from '../src/submissions/dtos';
import { SubmissionStatus } from '../src/submissions/constants';
import { Student } from '../src/students/entities';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let subRepo: any;
  let logRepo: any;
  let mediaRepo: any;
  let studentRepo: any;
  let ffmpeg: FFmpegService;
  let blob: BlobService;
  let ai: AiService;
  let evalSpy: jest.SpyInstance;
  let preprocessSpy: jest.SpyInstance;
  let uploadFileSpy: jest.SpyInstance;

  beforeEach(async () => {
    subRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    logRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    mediaRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    studentRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(async (e) => await { ...e, studentId: '1' }),
      create: jest.fn((e) => e),
    };

    const module = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: logRepo },
        { provide: getRepositoryToken(SubmissionMedia), useValue: mediaRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: FFmpegService, useValue: { preprocess: jest.fn().mockResolvedValue({ videoPath: '/tmp/v.mp4', audioPath: '/tmp/a.mp3' }) } },
        { provide: BlobService, useValue: { uploadFile: jest.fn().mockResolvedValue('https://example.com/file?sas=1') } },
        { provide: AiService, useValue: { evaluateEssay: jest.fn().mockResolvedValue({ score: 8, feedback: 'good', highlights: ['pizza'] }) } },
      ],
    }).compile();

    service = module.get(SubmissionsService);
    ffmpeg = module.get(FFmpegService);
    blob = module.get(BlobService);
    ai = module.get(AiService);
    evalSpy = jest.spyOn(ai, 'evaluateEssay');
    preprocessSpy = jest.spyOn(ffmpeg, 'preprocess');
    uploadFileSpy = jest.spyOn(blob, 'uploadFile');
  });

  it('creates submission and returns shaped response', async () => {
    const dto: CreateSubmissionDto = {
      studentId: 1,
      studentName: '홍길동',
      componentType: 'Essay Writing',
      submitText: 'Hello world, I like pizza',
    } as any;

    const result = await service.create(dto, undefined, 'trace-x');

    expect(result).toMatchObject({
      studentId: 1,
      studentName: '홍길동',
      score: 8,
      feedback: 'good',
      highlights: ['pizza'],
      mediaUrl: null,
    });
    expect(subRepo.save).toHaveBeenCalled();
    expect(logRepo.save).toHaveBeenCalled();
  });

  it('preprocess/upload when file provided', async () => {
    const dto = { studentId: 2, studentName: '김철수', componentType: 'Essay Writing', submitText: 'Essay' } as any;
    const file: any = { originalname: 'v.mp4', size: 10, buffer: Buffer.from('x') };

    const res = await service.create(dto, file, 't');
    expect(evalSpy).toHaveBeenCalled();

    expect(res.mediaUrl).toBeTruthy();
    expect(preprocessSpy).toHaveBeenCalled();
    expect(uploadFileSpy).toHaveBeenCalledTimes(2);
  });

  it('marks FAILED on error', async () => {
    (ai.evaluateEssay as jest.Mock).mockRejectedValueOnce(new Error('AI down'));
    const dto = { studentId: 3, studentName: '이영희', componentType: 'Essay Writing', submitText: 'Essay' } as any;

    await expect(service.create(dto, undefined, 't')).rejects.toThrow();
    expect(subRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: SubmissionStatus.FAILED }));
  });
});
