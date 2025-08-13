import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DevJwtGuard } from './auth/dev-jwt.guard';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: DevJwtGuard }],
})
export class CommonModule {}
