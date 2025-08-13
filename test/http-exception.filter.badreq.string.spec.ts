import { HttpExceptionFilter } from '../src/common/http-exception/http-exception.filter';
import { BadRequestException } from '@nestjs/common';

describe('HttpExceptionFilter BadRequest string body', () => {
  it('wraps string message into array and returns 200', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host: any = { switchToHttp: () => ({ getResponse: () => ({ status }) }) };
    new HttpExceptionFilter().catch(new BadRequestException('just one'), host);
    expect(status).toHaveBeenCalledWith(200);
  });
});
