import { HttpLoggingMiddleware } from '../src/common/logger/http-logger.util';

jest.mock('../src/common/logger/winston.logger', () => ({ logInfo: jest.fn() }));

describe('HttpLoggingMiddleware', () => {
  it('logs when response ends', () => {
    const mw = new HttpLoggingMiddleware();
    const req: any = { method: 'GET', url: '/v1', log: { info: jest.fn() } };
    let captured: any[] = [];
    const res: any = {
      statusCode: 200,
      end: (...args: any[]) => {
        captured = args;
      },
    };
    const next = jest.fn();
    mw.use(req, res, next);
    res.end('ok');

    expect(next).toHaveBeenCalled();
    expect(captured[0]).toBe('ok');
  });
});
