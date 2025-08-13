import { HttpExceptionFilter } from '../src/common/http-exception/http-exception.filter';
import { ArgumentsHost, HttpException } from '@nestjs/common';

describe('HttpExceptionFilter more', () => {
  function mockHost() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as any;
    const host: Partial<ArgumentsHost> = {
      switchToHttp: () => ({ getResponse: () => res }) as any,
    };
    return { host, res, status, json };
  }

  it('handles Multer custom message with 400', () => {
    const { host, status } = mockHost();
    const filter = new HttpExceptionFilter();
    filter.catch(new Error('비디오 파일만 업로드 가능합니다'), host as any);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('handles generic HttpException as 200 failed', () => {
    const { host, status } = mockHost();
    const filter = new HttpExceptionFilter();
    filter.catch(new HttpException('nope', 403), host as any);
    expect(status).toHaveBeenCalledWith(200);
  });
});
