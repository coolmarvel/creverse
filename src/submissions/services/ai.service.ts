import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureOpenAI } from 'openai';
import { z } from 'zod';

import { logInfo, logError } from '../../common/logger/winston.logger';

const EvalSchema = z.object({
  score: z.number().int().min(0).max(10),
  feedback: z.string(),
  highlights: z.array(z.string()).default([]),
});
export type EvalResult = z.infer<typeof EvalSchema>;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: AzureOpenAI;
  private readonly deployment: string;

  constructor(private readonly configService?: ConfigService) {
    const apiKey = this.configService?.get<string>('azure-openai.endpointKey');
    const endpoint = this.configService?.get<string>('azure-openai.endpointUrl');
    const apiVersion = this.configService?.get<string>('azure-openai.apiVersion');
    const deploymentName = this.configService?.get<string>('azure-openai.deploymentName');

    this.client = new AzureOpenAI({ apiKey: apiKey, endpoint: endpoint, apiVersion });
    this.deployment = deploymentName!;
  }

  async evaluateEssay(submitText: string, componentType: string): Promise<EvalResult> {
    const sys = `You are an English writing evaluator.
                  Return ONLY a strict JSON object with keys: score (0-10 integer), feedback (string), highlights (array of strings). 
                  If not perfect(10), add every penalized sentence/word into highlights. No extra keys.`;

    const user = `ComponentType: ${componentType}
Essay:
${submitText}`;

    try {
      const t0 = Date.now();
      const resp = await this.client.chat.completions.create({
        model: this.deployment,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
      });

      const raw = resp.choices?.[0]?.message?.content ?? '{}';
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // 일부 모델이 텍스트로 JSON을 감싸거나 설명을 섞는 경우 방어
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
        } else {
          throw new Error('AI returned non-JSON');
        }
      }
      const data = EvalSchema.parse(parsed);

      const latency = Date.now() - t0;
      this.logger.log(`AI latency ${latency} ms`);
      logInfo('AI_CALL completed', { latencyMs: latency, model: this.deployment });
      return data;
    } catch (e: any) {
      this.logger.error(`AI error: ${e?.message || e}`);
      logError('AI_CALL error', { error: e?.message || String(e), endpoint: this.configService?.get<string>('azure-openai.endpointUrl'), deployment: this.deployment });

      throw e;
    }
  }
}
