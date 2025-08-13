import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ enum: ['ok', 'failed'], description: '요청 처리 결과' })
  result: 'ok' | 'failed';

  @ApiProperty({ type: [String], nullable: true, description: '응답 메시지' })
  message: string | string[] | null;

  @ApiProperty({ description: '응답 데이터', required: false })
  data?: T;

  @ApiProperty({ type: Number, description: 'API 처리 시간(ms)', required: false })
  apiLatency?: number;

  @ApiProperty({ type: String, description: '타임스탬프', required: false })
  timestamp?: string;
}

export class SuccessResponseDto<T = any> extends ApiResponseDto<T> {
  @ApiProperty({ enum: ['ok'], default: 'ok' })
  result = 'ok' as const;
}

export class ErrorResponseDto extends ApiResponseDto<null> {
  @ApiProperty({ enum: ['failed'], default: 'failed' })
  result = 'failed' as const;

  @ApiProperty({ type: [String], description: '에러 메시지' })
  declare message: string | string[];
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    type: [String],
    description: '유효성 검증 실패 메시지 배열',
    example: ['studentId must be a number', 'submitText must be longer than 10 characters'],
  })
  declare message: string[];
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ enum: ['ok'], default: 'ok' })
  result: 'ok';

  @ApiProperty({ type: [String], nullable: true })
  message: string | null;

  @ApiProperty({ type: Number, description: '현재 페이지' })
  page: number;

  @ApiProperty({ type: Number, description: '페이지 크기' })
  size: number;

  @ApiProperty({ type: Number, description: '전체 개수' })
  total: number;

  @ApiProperty({ type: [Object], description: '데이터 목록' })
  items: T[];

  @ApiProperty({ type: Number, description: 'API 처리 시간(ms)' })
  apiLatency: number;
}
