import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReEvaluateDto {
  @ApiProperty()
  @IsUUID()
  submissionId: string;
}
