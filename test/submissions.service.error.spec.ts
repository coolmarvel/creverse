import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubmissionsService } from '../src/submissions/services/submissions.service';
import { Submission, SubmissionLog, SubmissionMedia } from '../src/submissions/entities';
import { FFmpegService } from '../src/submissions/services/ffmpeg.service';
import { BlobService } from '../src/submissions/services/blob.service';
import { AiService } from '../src/submissions/services/ai.service';
import { Student } from '../src/students/entities';
import { SubmissionStatus } from '../src/submissions/constants';

describe('SubmissionsService errors', () => {
  let service: SubmissionsService;
  let subRepo: any;
  let logRepo: any;
  let mediaRepo: any;
  let studentRepo: any;
  let moduleRef: any;

  beforeEach(async () => {
    subRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    logRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    mediaRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    studentRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn(async (e) => await { ...e, studentId: '1' }), create: jest.fn((e) => e) };

    moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: logRepo },
        { provide: getRepositoryToken(SubmissionMedia), useValue: mediaRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: FFmpegService, useValue: { preprocess: jest.fn().mockResolvedValue({ videoPath: '/tmp/v.mp4', audioPath: '/tmp/a.mp3' }) } },
        { provide: BlobService, useValue: { uploadFile: jest.fn() } },
        { provide: AiService, useValue: { evaluateEssay: jest.fn().mockResolvedValue({ score: 8, feedback: 'x', highlights: [] }) } },
      ],
    }).compile();

    service = moduleRef.get(SubmissionsService);
  });

  it('fails when blob upload throws', async () => {
    const file: any = { originalname: 'v.mp4', size: 10, buffer: Buffer.from('x') };
    const dto: any = { studentId: 7, studentName: 'A', componentType: 'Essay Writing', submitText: 'S' };
    const blob = moduleRef.get(BlobService);
    (blob.uploadFile as jest.Mock).mockRejectedValueOnce(new Error('blob error'));
    await expect(service.create(dto, file, 't')).rejects.toThrow('submission processing failed');

    expect(subRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: SubmissionStatus.FAILED }));
  });

  it('fails when ffmpeg preprocess throws', async () => {
    const file: any = { originalname: 'v.mp4', size: 10, buffer: Buffer.from('x') };
    const dto: any = { studentId: 8, studentName: 'B', componentType: 'Essay Writing', submitText: 'S' };
    const ffmpeg = moduleRef.get(FFmpegService);
    (ffmpeg.preprocess as jest.Mock).mockRejectedValueOnce(new Error('ffmpeg error'));
    await expect(service.create(dto, file, 't')).rejects.toThrow('submission processing failed');

    expect(subRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: SubmissionStatus.FAILED }));
  });
});
