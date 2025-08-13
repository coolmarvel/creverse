import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ReEvaluateDto } from '../dtos';
import { RevisionsService } from '../services';
import { API_RESPONSE_SCHEMAS, REVISION_RESPONSE_SCHEMAS, AUTH_RESPONSE_SCHEMAS } from '../../common/constants/api-response-schemas';

@ApiTags('revisions')
@ApiBearerAuth('Bearer')
@Controller('revision')
export class RevisionsController {
  constructor(private readonly service: RevisionsService) {}

  @Post()
  @ApiOperation({ summary: '재평가 요청', description: '기존 제출물에 대한 재평가를 요청합니다.' })
  @ApiResponse(REVISION_RESPONSE_SCHEMAS.REQUEST_SUCCESS)
  @ApiResponse(API_RESPONSE_SCHEMAS.VALIDATION_ERROR)
  @ApiResponse(REVISION_RESPONSE_SCHEMAS.REVISION_FAILED)
  @ApiResponse(AUTH_RESPONSE_SCHEMAS.MISSING_TOKEN)
  create(@Body() dto: ReEvaluateDto) {
    return this.service.request(dto);
  }

  @Get()
  @ApiOperation({ summary: '재평가 목록 조회', description: '재평가 이력을 페이지네이션으로 조회합니다.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: '페이지 크기 (기본값: 20)' })
  @ApiResponse(API_RESPONSE_SCHEMAS.SUCCESS)
  @ApiResponse(AUTH_RESPONSE_SCHEMAS.MISSING_TOKEN)
  list(@Query('page') page = 1, @Query('size') size = 20) {
    return this.service.list(+page, +size);
  }

  @Get(':id')
  @ApiOperation({ summary: '재평가 상세 조회', description: '특정 재평가의 상세 정보를 조회합니다.' })
  @ApiResponse(API_RESPONSE_SCHEMAS.SUCCESS)
  @ApiResponse(REVISION_RESPONSE_SCHEMAS.REVISION_NOT_FOUND)
  @ApiResponse(AUTH_RESPONSE_SCHEMAS.MISSING_TOKEN)
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }
}
