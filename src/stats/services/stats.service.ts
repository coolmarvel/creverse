import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submission } from '../../submissions/entities';
import { SubmissionStatus } from '../../submissions/constants';
import { StatsDaily, StatsWeekly, StatsMonthly } from '../entities';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(StatsDaily) private readonly dailyRepo: Repository<StatsDaily>,
    @InjectRepository(StatsWeekly) private readonly weeklyRepo: Repository<StatsWeekly>,
    @InjectRepository(StatsMonthly) private readonly monthlyRepo: Repository<StatsMonthly>,
    @InjectRepository(Submission) private readonly subRepo: Repository<Submission>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async aggregateDaily() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    const total = await this.subRepo.count();
    const success = await this.subRepo.count({ where: { status: SubmissionStatus.SUCCESS } });
    const failed = await this.subRepo.count({ where: { status: SubmissionStatus.FAILED } });
    const pending = await this.subRepo.count({ where: { status: SubmissionStatus.PENDING } });
    const processing = await this.subRepo.count({ where: { status: SubmissionStatus.PROCESSING } });

    await this.dailyRepo.save(this.dailyRepo.create({ statDate: dateStr, totalCount: total, successCount: success, failedCount: failed, pendingCount: pending, processingCount: processing }));
  }

  @Cron(CronExpression.EVERY_WEEK)
  async aggregateWeekly() {
    const d = new Date();
    const year = d.getUTCFullYear();
    const week = getWeekNumber(d);

    const total = await this.subRepo.count();
    const success = await this.subRepo.count({ where: { status: SubmissionStatus.SUCCESS } });
    const failed = await this.subRepo.count({ where: { status: SubmissionStatus.FAILED } });
    const pending = await this.subRepo.count({ where: { status: SubmissionStatus.PENDING } });
    const processing = await this.subRepo.count({ where: { status: SubmissionStatus.PROCESSING } });

    await this.weeklyRepo.save(
      this.weeklyRepo.create({ statYear: year, statWeek: week, totalCount: total, successCount: success, failedCount: failed, pendingCount: pending, processingCount: processing }),
    );
  }

  @Cron('0 0 1 * *')
  async aggregateMonthly() {
    const d = new Date();
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;

    const total = await this.subRepo.count();
    const success = await this.subRepo.count({ where: { status: SubmissionStatus.SUCCESS } });
    const failed = await this.subRepo.count({ where: { status: SubmissionStatus.FAILED } });
    const pending = await this.subRepo.count({ where: { status: SubmissionStatus.PENDING } });
    const processing = await this.subRepo.count({ where: { status: SubmissionStatus.PROCESSING } });

    await this.monthlyRepo.save(
      this.monthlyRepo.create({ statYear: year, statMonth: month, totalCount: total, successCount: success, failedCount: failed, pendingCount: pending, processingCount: processing }),
    );
  }
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
