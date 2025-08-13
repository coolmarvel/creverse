import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Submission } from '../src/submissions/entities';
import { SubmissionStatus } from '../src/submissions/constants';
import { AiService } from '../src/submissions/services/ai.service';
import { RetryService } from '../src/submissions/services/retry.service';

jest.mock('../src/common/logger/winston.logger', () => ({ logInfo: jest.fn(), logWarn: jest.fn() }));

describe('RetryService errors', () => {
  it('marks FAILED when AI evaluate throws', async () => {
    const sub = { submissionId: '1', submitText: 't', componentType: 'Essay Writing', status: SubmissionStatus.FAILED } as any;
    const statusSnapshots: string[] = [];
    const subRepo: Partial<Record<keyof Repository<Submission>, any>> = {
      find: jest.fn().mockResolvedValue([sub]),
      save: jest.fn((s: any) => {
        statusSnapshots.push(s.status);

        return s;
      }),
    };
    const ai: Partial<AiService> = { evaluateEssay: jest.fn().mockRejectedValue(new Error('AI fail')) };
    const moduleRef = await Test.createTestingModule({ providers: [RetryService, { provide: getRepositoryToken(Submission), useValue: subRepo }, { provide: AiService, useValue: ai }] }).compile();

    const service = moduleRef.get(RetryService);
    await service.retryFailed();

    expect(statusSnapshots[0]).toBe(SubmissionStatus.PROCESSING);
    expect(statusSnapshots[statusSnapshots.length - 1]).toBe(SubmissionStatus.FAILED);
  });
});
