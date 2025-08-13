import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { StatsService } from './services';
import { Submission } from '../submissions/entities';
import { StatsDaily, StatsMonthly, StatsWeekly } from './entities';

@Module({ imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([StatsDaily, StatsWeekly, StatsMonthly, Submission])], providers: [StatsService] })
export class StatsModule {}
