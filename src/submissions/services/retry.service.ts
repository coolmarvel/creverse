import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiService } from './ai.service';

import { Submission } from '../entities';
import { boldHighlights } from '../utils';
import { SubmissionStatus } from '../constants';
import { logInfo, logWarn } from '../../common/logger/winston.logger';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  constructor(
    @InjectRepository(Submission) private readonly subRepo: Repository<Submission>,
    private readonly ai: AiService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async retryFailed() {
    const candidates = await this.subRepo.find({ where: { status: SubmissionStatus.FAILED } });
    for (const sub of candidates) {
      try {
        sub.status = SubmissionStatus.PROCESSING;
        await this.subRepo.save(sub);

        const t0 = Date.now();
        const evalRes = await this.ai.evaluateEssay(sub.submitText, sub.componentType);
        sub.score = evalRes.score;
        sub.feedback = evalRes.feedback;
        sub.highlights = evalRes.highlights as any;
        sub.highlightSubmitText = boldHighlights(sub.submitText, evalRes.highlights);
        sub.status = SubmissionStatus.SUCCESS;
        sub.apiLatencyMs = Date.now() - t0;
        await this.subRepo.save(sub);
        try {
          logInfo('RETRY_SUCCESS', { submissionId: sub.submissionId, latencyMs: sub.apiLatencyMs });
        } catch {
          /* noop */
        }
      } catch (e) {
        this.logger.warn(`retry failed for ${sub.submissionId}: ${String(e)}`);
        sub.status = SubmissionStatus.FAILED;
        await this.subRepo.save(sub);
        try {
          logWarn('RETRY_FAILED', { submissionId: sub.submissionId, error: String(e) });
        } catch {
          /* noop */
        }
      }
    }
  }
}
