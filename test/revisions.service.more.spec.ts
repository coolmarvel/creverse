import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RevisionsService } from '../src/revisions/services/revisions.service';
import { Revision } from '../src/revisions/entities';
import { Submission, SubmissionLog } from '../src/submissions/entities';
import { AiService } from '../src/submissions/services/ai.service';

function repo<T>(overrides?: any) {
  return { findOne: jest.fn(), save: jest.fn((e: T) => e), create: jest.fn((e: Partial<T>) => e as T), findAndCount: jest.fn(), ...overrides };
}

describe('RevisionsService more', () => {
  it('request fails when AI throws', async () => {
    const revRepo = repo<Revision>();
    const subRepo = repo<Submission>({ findOne: jest.fn().mockResolvedValue({ submissionId: 's1', submitText: 't', componentType: 'Essay Writing', status: 'SUCCESS', traceId: 'tid' }) });
    const logRepo = repo<SubmissionLog>();
    const ai = { evaluateEssay: jest.fn().mockRejectedValue(new Error('AI err')) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        RevisionsService,
        { provide: getRepositoryToken(Revision), useValue: revRepo },
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: logRepo },
        { provide: AiService, useValue: ai },
      ],
    }).compile();
    const service = moduleRef.get(RevisionsService);
    await expect(service.request({ submissionId: 's1' } as any)).rejects.toThrow('revision processing failed');
  });

  it('detail throws when not found', async () => {
    const revRepo = repo<Revision>({ findOne: jest.fn().mockResolvedValue(null) });
    const moduleRef = await Test.createTestingModule({
      providers: [
        RevisionsService,
        { provide: getRepositoryToken(Revision), useValue: revRepo },
        { provide: getRepositoryToken(Submission), useValue: repo<Submission>() },
        { provide: getRepositoryToken(SubmissionLog), useValue: repo<SubmissionLog>() },
        { provide: AiService, useValue: {} },
      ],
    }).compile();
    const service = moduleRef.get(RevisionsService);
    await expect(service.detail('x')).rejects.toThrow('revision not found');
  });
});
