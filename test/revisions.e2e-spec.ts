import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { RevisionsService } from '../src/revisions/services/revisions.service';
import { HttpExceptionFilter } from '../src/common/http-exception/http-exception.filter';
import { ResponseInterceptor } from '../src/common/response/response.interceptor';

describe('Revisions E2E (mocked)', () => {
  let app: INestApplication;
  let httpServer: any;
  const token = process.env.JWT_BEARER_TOKEN || 'devtoken';
  const validUuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  const mockRevisionsService: any = {
    request: (dto: any) => ({ revisionId: 'rev-1', submissionId: dto.submissionId }),
    list: (page: number, size: number) => ({ page, size, total: 1, items: [{ revisionId: 'rev-1', submissionId: validUuid, status: 'PENDING' }] }),
    detail: (id: string) => ({ revisionId: id, submissionId: validUuid, status: 'PENDING' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(RevisionsService)
      .useValue(mockRevisionsService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/revision - request', async () => {
    const res = await request(httpServer).post('/v1/revision').set('Authorization', `Bearer ${token}`).send({ submissionId: validUuid }).expect(201);

    // 전역 필터 정책에 따라 실패도 200이 가능하므로 최소 필드만 검증
    expect(res.body).toHaveProperty('revisionId');
  });

  it('GET /v1/revision - list', async () => {
    const res = await request(httpServer).get('/v1/revision?page=1&size=10').set('Authorization', `Bearer ${token}`).expect(200);

    expect(res.body.result).toBe('ok');
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('GET /v1/revision/:id - detail', async () => {
    const res = await request(httpServer).get('/v1/revision/rev-1').set('Authorization', `Bearer ${token}`).expect(200);

    expect(res.body.result).toBe('ok');
    expect(res.body.revisionId).toBe('rev-1');
  });
});
