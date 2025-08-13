import { Logger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import { TraceMiddleware } from './common/logger/trace.middleware';
import { HttpLoggingMiddleware } from './common/logger/http-logger.util';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { HttpExceptionFilter } from './common/http-exception/http-exception.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService: ConfigService = app.get(ConfigService);

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('v1');

  const traceMiddleware = new TraceMiddleware();
  const httpLoggingMiddleware = new HttpLoggingMiddleware();
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));
  app.use(traceMiddleware.use.bind(traceMiddleware));
  app.use(httpLoggingMiddleware.use.bind(httpLoggingMiddleware));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Submission Evaluation API')
    .setDescription('AI 학습 평가 API')
    .setVersion('1.0.1')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'Bearer')
    .build();
  const customOptions: SwaggerCustomOptions = { swaggerOptions: { persistAuthorization: true } };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, customOptions);

  const port = configService.get<number>('PORT') || Number(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`🚀 Server is listening on http://localhost:${port}`);
  console.log(`📚 Swagger API documentation available at http://localhost:${port}/docs`);
}
bootstrap();
