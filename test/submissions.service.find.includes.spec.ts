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
    calls: { joins: [] as string[] },
    leftJoinAndSelect: jest.fn(function (this: any, rel: string, alias: string) {
      qb.calls.joins.push(`${rel} as ${alias}`);
      return this;
    }),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };
  return qb;
}

describe('SubmissionsService findAll includes', () => {
  async function setup(qb: any) {
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
    return moduleRef.get(SubmissionsService);
  }

  it('include=media only', async () => {
    const qb = makeQb();
    const service = await setup(qb);
    await service.findAll({ page: 1, size: 5, include: 'media' } as any);
    expect(qb.calls.joins).toEqual(['s.student as st', 's.media as media']);
  });
  it('include=logs only', async () => {
    const qb = makeQb();
    const service = await setup(qb);
    await service.findAll({ page: 1, size: 5, include: 'logs' } as any);
    expect(qb.calls.joins).toEqual(['s.student as st', 's.logs as logs']);
  });
  it('include=revisions only', async () => {
    const qb = makeQb();
    const service = await setup(qb);
    await service.findAll({ page: 1, size: 5, include: 'revisions' } as any);
    expect(qb.calls.joins).toEqual(['s.student as st', 's.revisions as revisions']);
  });
});
