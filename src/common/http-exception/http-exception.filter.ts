import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ResponseUtil } from '../response/response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Multer 등 파일 필터 사용자 메시지 처리 예시
    if (exception instanceof Error && exception.message?.includes('비디오 파일만 업로드 가능합니다')) {
      const errorResponse = ResponseUtil.createFutureApiErrorResponse([exception.message]);

      return response.status(400).json(errorResponse);
    }

    if (!(exception instanceof HttpException)) {
      const errorResponse = ResponseUtil.createFutureApiErrorResponse(['서버 내부 오류가 발생했습니다']);
      // 과제 요구: 실패 시에도 HTTP 200 유지
      return response.status(200).json(errorResponse);
    }

    // const status = exception.getStatus(); // 상태 코드는 200으로 고정 반환
    const exceptionResponse = exception.getResponse();

    let message: string | string[];

    if (exception instanceof BadRequestException) {
      const responseObj = exceptionResponse as { message?: string | string[] };
      if (responseObj && Array.isArray(responseObj.message)) message = responseObj.message;
      else if (responseObj && responseObj.message) message = Array.isArray(responseObj.message) ? responseObj.message : [responseObj.message];
      else message = ['입력값이 올바르지 않습니다'];
    } else if (typeof exceptionResponse === 'string') {
      message = [exceptionResponse];
    } else {
      const responseMessage = (exceptionResponse as { message?: string | string[] }).message;
      message = Array.isArray(responseMessage) ? responseMessage : [responseMessage || '오류가 발생했습니다'];
    }

    const errorResponse = ResponseUtil.createFutureApiErrorResponse(message);
    // 과제 요구: 실패 시에도 HTTP 200 유지
    response.status(200).json(errorResponse);
  }
}
