import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { StatsService } from '../src/stats/services/stats.service';
import { StatsDaily, StatsWeekly, StatsMonthly } from '../src/stats/entities';
import { Submission } from '../src/submissions/entities';
import { SubmissionStatus } from '../src/submissions/constants';

describe('StatsService', () => {
  let service: StatsService;
  let dailyRepo: any;
  let weeklyRepo: any;
  let monthlyRepo: any;
  let subRepo: any;

  beforeEach(async () => {
    dailyRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    weeklyRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    monthlyRepo = { save: jest.fn(async (e) => await e), create: jest.fn((e) => e) };
    subRepo = {
      count: jest.fn((opts?: any) => {
        if (!opts) return 10;
        if (opts.where?.status === SubmissionStatus.SUCCESS) return 6;
        if (opts.where?.status === SubmissionStatus.FAILED) return 2;
        if (opts.where?.status === SubmissionStatus.PENDING) return 1;
        if (opts.where?.status === SubmissionStatus.PROCESSING) return 1;
        return 0;
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: getRepositoryToken(StatsDaily), useValue: dailyRepo },
        { provide: getRepositoryToken(StatsWeekly), useValue: weeklyRepo },
        { provide: getRepositoryToken(StatsMonthly), useValue: monthlyRepo },
        { provide: getRepositoryToken(Submission), useValue: subRepo },
      ],
    }).compile();

    service = module.get(StatsService);
  });

  it('aggregates daily stats', async () => {
    await service.aggregateDaily();
    expect(dailyRepo.save).toHaveBeenCalledWith(expect.objectContaining({ totalCount: 10, successCount: 6, failedCount: 2 }));
  });

  it('aggregates weekly stats', async () => {
    await service.aggregateWeekly();
    expect(weeklyRepo.save).toHaveBeenCalledWith(expect.objectContaining({ totalCount: 10, successCount: 6, failedCount: 2 }));
  });

  it('aggregates monthly stats', async () => {
    await service.aggregateMonthly();
    expect(monthlyRepo.save).toHaveBeenCalledWith(expect.objectContaining({ totalCount: 10, successCount: 6, failedCount: 2 }));
  });
});
