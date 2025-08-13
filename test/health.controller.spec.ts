import { Test } from '@nestjs/testing';
import { HealthController } from '../src/common/health/health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  it('returns health check result', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: { check: jest.fn(async (arr: any[]) => ({ status: 'ok', details: await Promise.all(arr.map((f) => f())) })) } },
        { provide: TypeOrmHealthIndicator, useValue: { pingCheck: jest.fn(() => ({ database: { status: 'up' } })) } },
      ],
    }).compile();
    const ctrl = moduleRef.get(HealthController);
    const res = await ctrl.check();

    expect(res.status).toBe('ok');
  });
});
