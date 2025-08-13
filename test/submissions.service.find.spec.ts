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
    calls: { joins: [] as string[], orderBy: null as any, skip: 0, take: 0 },
    leftJoinAndSelect: jest.fn(function (this: any, rel: string, alias: string) {
      qb.calls.joins.push(`${rel} as ${alias}`);
      return this;
    }),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn(function (this: any, col: string, dir: any) {
      qb.calls.orderBy = [col, dir];
      return this;
    }),
    skip: jest.fn(function (this: any, v: number) {
      qb.calls.skip = v;
      return this;
    }),
    take: jest.fn(function (this: any, v: number) {
      qb.calls.take = v;
      return this;
    }),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };
  return qb;
}

describe('SubmissionsService find*', () => {
  it('findAll applies includes and sort', async () => {
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
    await service.findAll({ page: 2, size: 10, include: 'media,logs,revisions', sort: 'score,ASC' } as any);
    expect(qb.calls.joins).toEqual(expect.arrayContaining(['s.media as media', 's.logs as logs', 's.revisions as revisions']));
    expect(qb.calls.orderBy[0]).toBe('s.score');
    expect(qb.calls.orderBy[1]).toBe('ASC');
    expect(qb.calls.skip).toBe(10);
    expect(qb.calls.take).toBe(10);
  });

  it('findOne throws when not found', async () => {
    const subRepo: any = { findOne: jest.fn().mockResolvedValue(null), createQueryBuilder: jest.fn().mockReturnValue(makeQb()) };
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
    await expect(service.findOne('x')).rejects.toThrow('submission not found');
  });
});
