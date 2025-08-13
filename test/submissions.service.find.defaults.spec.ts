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
    calls: { joins: [] as string[], orderBy: null as any },
    leftJoinAndSelect: jest.fn(function (this: any, rel: string, alias: string) {
      qb.calls.joins.push(`${rel} as ${alias}`);
      return this;
    }),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn(function (this: any, col: string, dir: any) {
      qb.calls.orderBy = [col, dir];
      return this;
    }),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };
  return qb;
}

describe('SubmissionsService findAll defaults', () => {
  it('uses default sort createdAt DESC and only student join when no include', async () => {
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
    await service.findAll({ page: 1, size: 5 } as any);
    expect(qb.calls.joins).toEqual(['s.student as st']);
    expect(qb.calls.orderBy[0]).toBe('s.createdAt');
    expect(qb.calls.orderBy[1]).toBe('DESC');
  });

  it('falls back to createdAt when unknown sort field', async () => {
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
    await service.findAll({ page: 1, size: 5, sort: 'unknown,ASC' } as any);
    expect(qb.calls.orderBy[0]).toBe('s.createdAt');
    expect(qb.calls.orderBy[1]).toBe('ASC');
  });
});
