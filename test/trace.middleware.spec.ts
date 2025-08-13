import { TraceMiddleware } from '../src/common/logger/trace.middleware';

describe('TraceMiddleware', () => {
  it('sets x-trace-id header', () => {
    const mw = new TraceMiddleware();
    const req: any = { headers: {} };
    const res: any = { setHeader: jest.fn() };
    const next = jest.fn();
    mw.use(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('x-trace-id', expect.any(String));
    expect(req.traceId).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
