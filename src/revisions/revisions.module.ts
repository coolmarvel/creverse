import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Revision } from './entities';
import { RevisionsService } from './services';
import { RevisionsController } from './controllers';
import { SubmissionLog } from '../submissions/entities';
import { AiService } from '../submissions/services/ai.service';

import { Submission } from '../submissions/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Revision, Submission, SubmissionLog])],
  controllers: [RevisionsController],
  providers: [RevisionsService, AiService],
})
export class RevisionsModule {}
