import { HttpExceptionFilter } from '../src/common/http-exception/http-exception.filter';
import { BadRequestException, HttpException } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  function mockHost(): any {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
      _resp: { status, json },
    };
  }

  it('wraps generic Error to 200 failed response', () => {
    const filter = new HttpExceptionFilter();
    const host = mockHost();
    filter.catch(new Error('서버 내부 오류가 발생했습니다'), host);
    expect(host._resp.status).toHaveBeenCalledWith(200);
  });

  it('BadRequestException returns 200 with messages[]', () => {
    const filter = new HttpExceptionFilter();
    const host = mockHost();
    filter.catch(new BadRequestException({ message: ['a', 'b'] }), host);
    expect(host._resp.status).toHaveBeenCalledWith(200);
  });

  it('HttpException with string message returns 200', () => {
    const filter = new HttpExceptionFilter();
    const host = mockHost();
    filter.catch(new HttpException('not found', 404), host);
    expect(host._resp.status).toHaveBeenCalledWith(200);
  });
});
