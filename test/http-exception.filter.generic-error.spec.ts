import { HttpExceptionFilter } from '../src/common/http-exception/http-exception.filter';

describe('HttpExceptionFilter generic Error', () => {
  it('wraps generic error to 200 and array message', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host: any = { switchToHttp: () => ({ getResponse: () => ({ status }) }) };
    const filter = new HttpExceptionFilter();
    filter.catch(new Error('서버 내부 오류가 발생했습니다'), host);
    expect(status).toHaveBeenCalledWith(200);
  });
});
