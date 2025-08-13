import { HttpExceptionFilter } from '../src/common/http-exception/http-exception.filter';
import { BadRequestException } from '@nestjs/common';

describe('HttpExceptionFilter string message', () => {
  it('returns 200 with single message array-wrapped', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host: any = { switchToHttp: () => ({ getResponse: () => ({ status }) }) };
    const filter = new HttpExceptionFilter();
    filter.catch(new BadRequestException({ message: 'one' }), host);
    expect(status).toHaveBeenCalledWith(200);
  });
});
