import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Student } from './entities';

@Module({ imports: [TypeOrmModule.forFeature([Student])] })
export class StudentsModule {}
