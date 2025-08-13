import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetryService } from '../src/submissions/services/retry.service';
import { AiService } from '../src/submissions/services/ai.service';
import { Submission } from '../src/submissions/entities';
import { SubmissionStatus } from '../src/submissions/constants';

jest.mock('../src/common/logger/winston.logger', () => ({ logInfo: jest.fn(), logWarn: jest.fn() }));

describe('RetryService', () => {
  it('retries FAILED submissions and marks SUCCESS', async () => {
    const statusCalls: string[] = [];
    const subRepo: Partial<Record<keyof Repository<Submission>, any>> = {
      find: jest.fn().mockResolvedValue([{ submissionId: '1', submitText: 't', componentType: 'Essay Writing', status: SubmissionStatus.FAILED }] as any),
      save: jest.fn((s: any) => {
        statusCalls.push(s.status);
        return s;
      }),
    };
    const ai: Partial<AiService> = {
      evaluateEssay: jest.fn().mockResolvedValue({ score: 9, feedback: 'ok', highlights: [] }),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [RetryService, { provide: getRepositoryToken(Submission), useValue: subRepo }, { provide: AiService, useValue: ai }],
    }).compile();

    const service = moduleRef.get(RetryService);
    await service.retryFailed();

    expect(subRepo.find).toHaveBeenCalled();
    expect(ai.evaluateEssay).toHaveBeenCalled();
    expect(statusCalls[0]).toBe(SubmissionStatus.PROCESSING);
    expect(statusCalls[1]).toBe(SubmissionStatus.SUCCESS);
  });
});
