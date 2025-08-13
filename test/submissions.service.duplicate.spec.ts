import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubmissionsService } from '../src/submissions/services/submissions.service';
import { Submission, SubmissionLog, SubmissionMedia } from '../src/submissions/entities';
import { FFmpegService } from '../src/submissions/services/ffmpeg.service';
import { BlobService } from '../src/submissions/services/blob.service';
import { AiService } from '../src/submissions/services/ai.service';
import { Student } from '../src/students/entities';

describe('SubmissionsService duplicate', () => {
  it('throws on duplicate component request for same student', async () => {
    const subRepo = { findOne: jest.fn().mockResolvedValue({ submissionId: 'x' }) } as any;
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: { save: jest.fn(), create: jest.fn() } },
        { provide: getRepositoryToken(SubmissionMedia), useValue: { save: jest.fn(), create: jest.fn() } },
        { provide: getRepositoryToken(Student), useValue: { findOne: jest.fn(), save: jest.fn(), create: jest.fn() } },
        { provide: FFmpegService, useValue: { preprocess: jest.fn() } },
        { provide: BlobService, useValue: { uploadFile: jest.fn() } },
        { provide: AiService, useValue: { evaluateEssay: jest.fn() } },
      ],
    }).compile();
    const service = moduleRef.get(SubmissionsService);
    await expect(service.create({ studentId: 1, studentName: 'A', componentType: 'Essay Writing', submitText: 't' } as any)).rejects.toThrow('already requested for this component');
  });
});
