import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubmissionDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  studentId: number;
  @ApiProperty() @IsString() @IsNotEmpty() studentName: string;
  @ApiProperty({ example: 'Essay Writing' })
  @IsString()
  @IsNotEmpty()
  componentType: string;

  @ApiProperty({ example: 'Hello my name is ...' })
  @IsString()
  @IsNotEmpty()
  submitText: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  videoFile?: any;
}
