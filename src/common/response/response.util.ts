import { HttpStatus } from '@nestjs/common';
import { ApiErrorResponse, ApiSuccessResponse, StandardErrorResponse, StandardSuccessResponse, FutureApiResponse } from './api-response.interface';

export class ResponseUtil {
  static createErrorResponse(exceptionResponse: string | Record<string, unknown>): ApiErrorResponse {
    const messageArray = typeof exceptionResponse === 'string' ? [exceptionResponse] : this.extractMessageAsArray(exceptionResponse);

    return {
      result: 'failed',
      message: messageArray.length > 1 ? messageArray : messageArray[0] || '오류가 발생했습니다',
      timestamp: new Date().toISOString(),
    } as ApiErrorResponse;
  }

  static createSuccessResponse<T = unknown>(message: string | null, data?: T): ApiSuccessResponse<T> {
    return {
      result: 'ok',
      message,
      data,
      timestamp: new Date().toISOString(),
    } as ApiSuccessResponse<T>;
  }

  static createStandardErrorResponse(exceptionResponse: string | Record<string, unknown>, status: number): StandardErrorResponse {
    const messageArray = typeof exceptionResponse === 'string' ? [exceptionResponse] : this.extractMessageAsArray(exceptionResponse);

    return {
      success: false,
      statusCode: status,
      message: messageArray.length > 1 ? messageArray : messageArray[0] || '오류가 발생했습니다',
      timestamp: new Date().toISOString(),
    };
  }

  static createStandardSuccessResponse<T = unknown>(message: string | null, data?: T, statusCode: number = HttpStatus.OK): StandardSuccessResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static createFutureApiResponse<T = unknown>(message: string | null, data?: T, result: 'ok' | 'failed' = 'ok'): FutureApiResponse<T> {
    const response: FutureApiResponse<T> = { result, message };
    if (data !== null && data !== undefined) (response as FutureApiResponse<T> & { data: T }).data = data;
    return response;
  }

  static createFutureApiErrorResponse(message: string | string[]): FutureApiResponse<null> {
    const messageArray = Array.isArray(message) ? message.flat() : [message];

    return { result: 'failed', message: messageArray.length === 1 ? messageArray[0] : messageArray };
  }

  private static extractMessageAsArray(exceptionResponse: Record<string, unknown>): string[] {
    if (exceptionResponse && typeof exceptionResponse === 'object') {
      if ('message' in exceptionResponse) {
        const msg = (exceptionResponse as any).message;
        if (Array.isArray(msg) && msg.every((item) => typeof item === 'string')) return msg;
        if (typeof msg === 'string') return [msg];
      }
    }

    return ['오류가 발생했습니다'];
  }
}
