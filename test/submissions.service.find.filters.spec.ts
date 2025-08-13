import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubmissionsService } from '../src/submissions/services/submissions.service';
import { Submission, SubmissionLog, SubmissionMedia } from '../src/submissions/entities';
import { Student } from '../src/students/entities';
import { FFmpegService } from '../src/submissions/services/ffmpeg.service';
import { BlobService } from '../src/submissions/services/blob.service';
import { AiService } from '../src/submissions/services/ai.service';

function makeQb() {
  const qb: any = {
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };
  return qb;
}

describe('SubmissionsService findAll filters', () => {
  it('applies status filter', async () => {
    const qb = makeQb();
    const subRepo: any = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: {} },
        { provide: getRepositoryToken(SubmissionMedia), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: FFmpegService, useValue: {} },
        { provide: BlobService, useValue: {} },
        { provide: AiService, useValue: {} },
      ],
    }).compile();
    const service = moduleRef.get(SubmissionsService);
    await service.findAll({ page: 1, size: 10, status: 'FAILED' } as any);
    expect(qb.andWhere).toHaveBeenCalledWith('s.status = :status', { status: 'FAILED' });
  });
  it('applies studentId filter', async () => {
    const qb = makeQb();
    const subRepo: any = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: {} },
        { provide: getRepositoryToken(SubmissionMedia), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: FFmpegService, useValue: {} },
        { provide: BlobService, useValue: {} },
        { provide: AiService, useValue: {} },
      ],
    }).compile();
    const service = moduleRef.get(SubmissionsService);
    await service.findAll({ page: 1, size: 10, studentId: 3 } as any);
    expect(qb.andWhere).toHaveBeenCalledWith('s.studentId = :studentId', { studentId: 3 });
  });
  it('applies studentName filter (ILIKE)', async () => {
    const qb = makeQb();
    const subRepo: any = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: {} },
        { provide: getRepositoryToken(SubmissionMedia), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: FFmpegService, useValue: {} },
        { provide: BlobService, useValue: {} },
        { provide: AiService, useValue: {} },
      ],
    }).compile();
    const service = moduleRef.get(SubmissionsService);
    await service.findAll({ page: 1, size: 10, studentName: '홍' } as any);
    expect(qb.andWhere).toHaveBeenCalledWith('st.studentName ILIKE :nm', { nm: '%홍%' });
  });
});
