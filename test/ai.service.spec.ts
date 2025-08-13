import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../src/submissions/services/ai.service';

jest.mock('openai', () => {
  return {
    AzureOpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: '{"score":8,"feedback":"ok","highlights":["a"]}' } }],
          }),
        },
      },
    })),
  };
});

describe('AiService', () => {
  it('evaluateEssay returns parsed data', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const map: Record<string, string> = {
                'azure-openai.endpointKey': 'k',
                'azure-openai.endpointUrl': 'http://localhost',
                'azure-openai.apiVersion': '2024-02-15-preview',
                'azure-openai.deploymentName': 'gpt',
              };
              return map[key];
            },
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(AiService);
    const res = await service.evaluateEssay('hello', 'Essay Writing');
    expect(res.score).toBe(8);
    expect(res.feedback).toBe('ok');
    expect(Array.isArray(res.highlights)).toBe(true);
  });

  it('evaluateEssay tolerates wrapped JSON text', async () => {
    const { AzureOpenAI } = jest.requireMock('openai');
    AzureOpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'some text {"score":7,"feedback":"fine","highlights":[]} trailing' } }],
          }),
        },
      },
    }));

    const moduleRef = await Test.createTestingModule({
      providers: [AiService, { provide: ConfigService, useValue: { get: () => 'x' } }],
    }).compile();
    const service = moduleRef.get(AiService);
    const res = await service.evaluateEssay('hello', 'Essay Writing');
    expect(res.score).toBe(7);
  });
});
