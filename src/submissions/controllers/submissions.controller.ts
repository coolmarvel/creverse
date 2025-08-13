import { Controller, Get, Post, Param, Body, Query, UploadedFile, UseInterceptors, HttpCode, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { CreateSubmissionDto } from '../dtos';
import { SubmissionsService } from '../services';
import { API_RESPONSE_SCHEMAS, SUBMISSION_RESPONSE_SCHEMAS, AUTH_RESPONSE_SCHEMAS, FILE_RESPONSE_SCHEMAS } from '../../common/constants/api-response-schemas';

@ApiTags('submissions')
@ApiBearerAuth('Bearer')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly service: SubmissionsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '에세이 제출', description: '학생의 에세이를 제출하고 AI 평가를 받습니다.' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'integer' },
        studentName: { type: 'string' },
        componentType: { type: 'string', example: 'Essay Writing' },
        submitText: { type: 'string' },
        videoFile: { type: 'string', format: 'binary' },
      },
      required: ['studentId', 'studentName', 'componentType', 'submitText'],
    },
  })
  @UseInterceptors(FileInterceptor('videoFile', { storage: memoryStorage() }))
  @ApiResponse(SUBMISSION_RESPONSE_SCHEMAS.SUBMIT_SUCCESS)
  @ApiResponse(API_RESPONSE_SCHEMAS.VALIDATION_ERROR)
  @ApiResponse(SUBMISSION_RESPONSE_SCHEMAS.ALREADY_SUBMITTED)
  @ApiResponse(AUTH_RESPONSE_SCHEMAS.MISSING_TOKEN)
  @ApiResponse(FILE_RESPONSE_SCHEMAS.INVALID_FILE_TYPE)
  @ApiResponse(API_RESPONSE_SCHEMAS.INTERNAL_SERVER_ERROR)
  create(@Body() dto: CreateSubmissionDto, @UploadedFile() file: Express.Multer.File | undefined, @Req() req: any) {
    return this.service.create(dto, file, req?.traceId);
  }

  @Get()
  @ApiOperation({ summary: '제출 목록 조회', description: '제출물 목록을 페이지네이션과 필터링으로 조회합니다.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: '페이지 크기 (기본값: 20)' })
  @ApiQuery({ name: 'status', required: false, description: 'PENDING|PROCESSING|SUCCESS|FAILED' })
  @ApiQuery({ name: 'studentId', required: false, type: Number })
  @ApiQuery({ name: 'studentName', required: false, type: String })
  @ApiQuery({ name: 'include', required: false, description: 'media,logs,revisions' })
  @ApiQuery({ name: 'sort', required: false, example: 'createdAt,DESC' })
  @ApiResponse(SUBMISSION_RESPONSE_SCHEMAS.LIST_SUCCESS)
  @ApiResponse(API_RESPONSE_SCHEMAS.BAD_REQUEST)
  @ApiResponse(AUTH_RESPONSE_SCHEMAS.MISSING_TOKEN)
  findAll(
    @Query('page') page = 1,
    @Query('size') size = 20,
    @Query('status') status?: string,
    @Query('studentId') studentId?: number,
    @Query('studentName') studentName?: string,
    @Query('include') include?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.findAll({ page: +page, size: +size, status, studentId, studentName, include, sort });
  }

  @Get(':id')
  @ApiOperation({ summary: '제출 상세 조회', description: '특정 제출물의 상세 정보를 조회합니다.' })
  @ApiResponse(SUBMISSION_RESPONSE_SCHEMAS.SUBMIT_SUCCESS)
  @ApiResponse(SUBMISSION_RESPONSE_SCHEMAS.SUBMISSION_NOT_FOUND)
  @ApiResponse(AUTH_RESPONSE_SCHEMAS.MISSING_TOKEN)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
