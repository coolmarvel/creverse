import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { SubmissionsService } from '../src/submissions/services';
import { HttpExceptionFilter } from '../src/common/http-exception/http-exception.filter';
import { ResponseInterceptor } from '../src/common/response/response.interceptor';

describe('Submissions E2E (mocked services)', () => {
  let app: INestApplication;
  let httpServer: any;

  const token = process.env.JWT_BEARER_TOKEN || 'devtoken';

  const mockSubmissionsService: any = {
    create: (dto: any) => ({
      submissionId: 'uuid-1',
      studentId: dto.studentId,
      studentName: dto.studentName,
      score: 8,
      feedback: 'Great',
      highlights: ['pizza'],
      submitText: dto.submitText,
      highlightSubmitText: `${dto.submitText} <b>pizza</b>`,
      mediaUrl: null,
    }),
    findAll: () => ({
      page: 1,
      size: 20,
      total: 1,
      items: [
        {
          submissionId: 'uuid-1',
          studentId: '1',
          componentType: 'Essay Writing',
          status: 'SUCCESS',
          score: 8,
          createdAt: new Date().toISOString(),
          submitText: 'Hello',
          result: 'ok' as any,
          message: null as any,
        },
      ],
    }),
    findOne: (id: string) => ({ submissionId: id, studentId: '1', submitText: 'Hello', score: 8, componentType: 'Essay Writing', status: 'SUCCESS' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SubmissionsService)
      .useValue(mockSubmissionsService)
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

  it('POST /v1/submissions - JSON', async () => {
    const res = await request(httpServer)
      .post('/v1/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: 1, studentName: '홍길동', componentType: 'Essay Writing', submitText: 'Hello pizza' })
      .expect(200);

    expect(res.body.result).toBe('ok');
    expect(res.body.studentId).toBe(1);
    expect(res.body.studentName).toBe('홍길동');
  });

  it('GET /v1/submissions - list', async () => {
    const res = await request(httpServer).get('/v1/submissions').set('Authorization', `Bearer ${token}`).expect(200);

    expect(res.body.result).toBe('ok');
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('GET /v1/submissions/:id - detail', async () => {
    const res = await request(httpServer).get('/v1/submissions/uuid-1').set('Authorization', `Bearer ${token}`).expect(200);

    expect(res.body.result).toBe('ok');
    expect(res.body.submissionId).toBe('uuid-1');
  });
});
