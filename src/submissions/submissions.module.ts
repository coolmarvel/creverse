import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Student } from '../students/entities';
import { SubmissionsController } from './controllers';
import { Submission, SubmissionLog, SubmissionMedia } from './entities';
import { SubmissionsService, FFmpegService, BlobService, AiService, RetryService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, SubmissionLog, SubmissionMedia, Student])],
  providers: [SubmissionsService, FFmpegService, BlobService, AiService, RetryService],
  controllers: [SubmissionsController],
  exports: [TypeOrmModule, SubmissionsService],
})
export class SubmissionsModule {}
