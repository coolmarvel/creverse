import { HttpStatus } from '@nestjs/common';
import { ResponseUtil } from '../src/common/response/response.util';

describe('ResponseUtil', () => {
  describe('createErrorResponse', () => {
    it('should create error response with string message', () => {
      const result = ResponseUtil.createErrorResponse('Test error');

      expect(result.result).toBe('failed');
      expect(result.message).toBe('Test error');
      expect(result.timestamp).toBeDefined();
    });

    it('should create error response with object containing message array', () => {
      const result = ResponseUtil.createErrorResponse({
        message: ['Error 1', 'Error 2'],
      });

      expect(result.result).toBe('failed');
      expect(result.message).toEqual(['Error 1', 'Error 2']);
    });

    it('should create error response with object containing single message', () => {
      const result = ResponseUtil.createErrorResponse({
        message: 'Single error',
      });

      expect(result.result).toBe('failed');
      expect(result.message).toBe('Single error');
    });

    it('should handle empty object with default message', () => {
      const result = ResponseUtil.createErrorResponse({});

      expect(result.result).toBe('failed');
      expect(result.message).toBe('오류가 발생했습니다');
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = ResponseUtil.createSuccessResponse('Success', data);

      expect(result.result).toBe('ok');
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(data);
      expect(result.timestamp).toBeDefined();
    });

    it('should create success response without data', () => {
      const result = ResponseUtil.createSuccessResponse('Success');

      expect(result.result).toBe('ok');
      expect(result.message).toBe('Success');
      expect(result.data).toBeUndefined();
    });

    it('should create success response with null message', () => {
      const result = ResponseUtil.createSuccessResponse(null);

      expect(result.result).toBe('ok');
      expect(result.message).toBeNull();
    });
  });

  describe('createStandardErrorResponse', () => {
    it('should create standard error response', () => {
      const result = ResponseUtil.createStandardErrorResponse('Bad request', HttpStatus.BAD_REQUEST);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Bad request');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle message array', () => {
      const result = ResponseUtil.createStandardErrorResponse({ message: ['Error 1', 'Error 2'] }, HttpStatus.UNPROCESSABLE_ENTITY);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(422);
      expect(result.message).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('createStandardSuccessResponse', () => {
    it('should create standard success response with default status', () => {
      const data = { result: 'test' };
      const result = ResponseUtil.createStandardSuccessResponse('Success', data);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(data);
    });

    it('should create standard success response with custom status', () => {
      const result = ResponseUtil.createStandardSuccessResponse('Created', { id: 1 }, HttpStatus.CREATED);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Created');
    });
  });

  describe('createFutureApiResponse', () => {
    it('should create success API response with data', () => {
      const data = { score: 8 };
      const result = ResponseUtil.createFutureApiResponse('Evaluated', data);

      expect(result.result).toBe('ok');
      expect(result.message).toBe('Evaluated');
      expect(result.data).toEqual(data);
    });

    it('should create failed API response', () => {
      const result = ResponseUtil.createFutureApiResponse('Failed', null, 'failed');

      expect(result.result).toBe('failed');
      expect(result.message).toBe('Failed');
      expect(result.data).toBeUndefined();
    });

    it('should handle undefined data', () => {
      const result = ResponseUtil.createFutureApiResponse('Success', undefined);

      expect(result.result).toBe('ok');
      expect(result.message).toBe('Success');
      expect(result.data).toBeUndefined();
    });

    it('should handle null message', () => {
      const result = ResponseUtil.createFutureApiResponse(null, { test: true });

      expect(result.result).toBe('ok');
      expect(result.message).toBeNull();
      expect(result.data).toEqual({ test: true });
    });
  });

  describe('createFutureApiErrorResponse', () => {
    it('should create error response with single message', () => {
      const result = ResponseUtil.createFutureApiErrorResponse('Error message');

      expect(result.result).toBe('failed');
      expect(result.message).toBe('Error message');
      expect(result.data).toBeUndefined();
    });

    it('should create error response with message array', () => {
      const result = ResponseUtil.createFutureApiErrorResponse(['Error 1', 'Error 2']);

      expect(result.result).toBe('failed');
      expect(result.message).toEqual(['Error 1', 'Error 2']);
    });

    it('should flatten nested arrays', () => {
      const result = ResponseUtil.createFutureApiErrorResponse([['Error 1'], 'Error 2'] as any);

      expect(result.result).toBe('failed');
      expect(Array.isArray(result.message)).toBe(true);
      expect((result.message as string[]).includes('Error 1')).toBe(true);
      expect((result.message as string[]).includes('Error 2')).toBe(true);
    });
  });
});
