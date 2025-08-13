import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { RevisionsService } from '../src/revisions/services/revisions.service';
import { Revision } from '../src/revisions/entities';
import { Submission, SubmissionLog } from '../src/submissions/entities';
import { AiService } from '../src/submissions/services/ai.service';
import { SubmissionStatus } from '../src/submissions/constants';

describe('RevisionsService', () => {
  let service: RevisionsService;
  let revRepo: any;
  let subRepo: any;
  let logRepo: any;
  let ai: AiService;
  let evalSpy: jest.SpyInstance;

  beforeEach(async () => {
    revRepo = { save: jest.fn((e) => ({ ...e, revisionId: 'r1' })), create: jest.fn((e) => e), findOne: jest.fn() };
    subRepo = { findOne: jest.fn().mockResolvedValue({ submissionId: 's1', submitText: 'text', componentType: 'Essay Writing', status: SubmissionStatus.FAILED }), save: jest.fn((e) => e) };
    logRepo = { save: jest.fn((e) => e), create: jest.fn((e) => e) };

    const module = await Test.createTestingModule({
      providers: [
        RevisionsService,
        { provide: getRepositoryToken(Revision), useValue: revRepo },
        { provide: getRepositoryToken(Submission), useValue: subRepo },
        { provide: getRepositoryToken(SubmissionLog), useValue: logRepo },
        { provide: AiService, useValue: { evaluateEssay: jest.fn().mockResolvedValue({ score: 9, feedback: 'ok', highlights: [] }) } },
      ],
    }).compile();

    service = module.get(RevisionsService);
    ai = module.get(AiService);
    evalSpy = jest.spyOn(ai, 'evaluateEssay');
  });

  it('requests re-evaluation and updates submission/revision', async () => {
    const res = await service.request({ submissionId: 's1' } as any);
    expect(res).toHaveProperty('revisionId');
    expect(evalSpy).toHaveBeenCalled();
    expect(subRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: SubmissionStatus.SUCCESS }));
  });

  it('handles missing submission', async () => {
    subRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.request({ submissionId: 's-x' } as any)).rejects.toThrow('submission not found');
  });
});
