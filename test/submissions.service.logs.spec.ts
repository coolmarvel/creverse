import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubmissionsService } from '../src/submissions/services/submissions.service';
import { Submission, SubmissionLog, SubmissionMedia } from '../src/submissions/entities';
import { FFmpegService } from '../src/submissions/services/ffmpeg.service';
import { BlobService } from '../src/submissions/services/blob.service';
import { AiService } from '../src/submissions/services/ai.service';
import { Student } from '../src/students/entities';

function setup(overrides?: { blobError?: boolean; aiError?: boolean }) {
  const subRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
  const logRepo = {
    saves: [] as any[],
    save: jest.fn((e) => {
      (logRepo.saves as any[]).push(e);
      return e;
    }),
    create: jest.fn((e) => e),
  } as any;
  const mediaRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
  const studentRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
  const ffmpeg = { preprocess: jest.fn().mockResolvedValue({ videoPath: '/tmp/v.mp4', audioPath: '/tmp/a.mp3' }) };
  const blob = { uploadFile: jest.fn() } as any;
  const ai = { evaluateEssay: jest.fn().mockResolvedValue({ score: 7, feedback: 'ok', highlights: [] }) } as any;
  if (overrides?.blobError) {
    blob.uploadFile.mockRejectedValue(new Error('blob err'));
  } else {
    blob.uploadFile.mockResolvedValue('https://u');
  }
  if (overrides?.aiError) {
    ai.evaluateEssay.mockRejectedValue(new Error('ai err'));
  }
  return { subRepo, logRepo, mediaRepo, studentRepo, ffmpeg, blob, ai };
}

describe('SubmissionsService logs', () => {
  it('fills BLOB_UPLOAD_OK with request/response/latency', async () => {
    const { subRepo, logRepo, mediaRepo, studentRepo, ffmpeg, blob, ai } = setup();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: logRepo },
        { provide: getRepositoryToken(SubmissionMedia), useValue: mediaRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: FFmpegService, useValue: ffmpeg },
        { provide: BlobService, useValue: blob },
        { provide: AiService, useValue: ai },
      ],
    }).compile();
    const service = moduleRef.get(SubmissionsService);
    await service.create({ studentId: 1, studentName: 'a', componentType: 'Essay Writing', submitText: 't' } as any, { originalname: 'v.mp4', size: 10, buffer: Buffer.from('x') } as any, 'tid');
    const ok = (logRepo.saves as any[]).find((l) => l.step === 'BLOB_UPLOAD_OK');
    expect(ok).toBeDefined();
    expect(ok.requestPayload).toBeTruthy();
    expect(ok.responsePayload).toBeTruthy();
    expect(ok.latencyMs).toBeGreaterThanOrEqual(0);
    expect(ok.traceId).toBe('tid');
  });

  it('fills BLOB_UPLOAD_FAILED with error/httpStatus', async () => {
    const { subRepo, logRepo, mediaRepo, studentRepo, ffmpeg, blob, ai } = setup({ blobError: true });
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: logRepo },
        { provide: getRepositoryToken(SubmissionMedia), useValue: mediaRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: FFmpegService, useValue: ffmpeg },
        { provide: BlobService, useValue: blob },
        { provide: AiService, useValue: ai },
      ],
    }).compile();
    const service = moduleRef.get(SubmissionsService);
    await expect(
      service.create({ studentId: 1, studentName: 'a', componentType: 'Essay Writing', submitText: 't' } as any, { originalname: 'v.mp4', size: 10, buffer: Buffer.from('x') } as any, 'tid'),
    ).rejects.toThrow('submission processing failed');
    const fail = (logRepo.saves as any[]).find((l) => l.step === 'BLOB_UPLOAD_FAILED');
    expect(fail).toBeDefined();
    expect(fail.responsePayload?.error).toContain('blob err');
  });

  it('fills EVAL_FAILED with error and latency', async () => {
    const { subRepo, logRepo, mediaRepo, studentRepo, ffmpeg, blob, ai } = setup({ aiError: true });
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: logRepo },
        { provide: getRepositoryToken(SubmissionMedia), useValue: mediaRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: FFmpegService, useValue: ffmpeg },
        { provide: BlobService, useValue: blob },
        { provide: AiService, useValue: ai },
      ],
    }).compile();
    const service = moduleRef.get(SubmissionsService);
    await expect(service.create({ studentId: 1, studentName: 'a', componentType: 'Essay Writing', submitText: 't' } as any, undefined, 'tid')).rejects.toThrow('submission processing failed');
    const fail = (logRepo.saves as any[]).find((l) => l.step === 'EVAL_FAILED');
    expect(fail).toBeDefined();
    expect(fail.responsePayload?.error).toContain('ai err');
    expect(fail.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
