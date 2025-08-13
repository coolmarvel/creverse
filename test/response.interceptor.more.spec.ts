import { ResponseInterceptor } from '../src/common/response/response.interceptor';
import { of } from 'rxjs';

// no-op helper removed (lint cleanup)

describe('ResponseInterceptor more', () => {
  it('wraps primitive data', (done) => {
    const i = new ResponseInterceptor();
    const ctx: any = {
      switchToHttp: () => ({ getResponse: () => ({ setHeader: jest.fn() }), getRequest: () => ({ traceId: 't' }) }),
    };
    const next: any = { handle: () => of(123) };
    // execute
    i.intercept(ctx, next).subscribe((out: any) => {
      expect(out.result).toBe('ok');
      expect(out.data).toBe(123);
      done();
    });
  });

  it('passes through when result already exists', (done) => {
    const i = new ResponseInterceptor();
    const ctx: any = {
      switchToHttp: () => ({ getResponse: () => ({ setHeader: jest.fn() }), getRequest: () => ({ traceId: 't' }) }),
    };
    const payload = { result: 'ok', message: null, hello: 'world' };
    const next: any = { handle: () => of(payload) };
    i.intercept(ctx, next).subscribe((out: any) => {
      expect(out).toBe(payload);
      done();
    });
  });

  it('wraps null and undefined', (done) => {
    const i = new ResponseInterceptor();
    const ctx: any = { switchToHttp: () => ({ getResponse: () => ({ setHeader: jest.fn() }), getRequest: () => ({ traceId: 't' }) }) };
    const nextNull: any = { handle: () => of(null) };
    const nextUndef: any = { handle: () => of(undefined) };
    let count = 0;
    i.intercept(ctx, nextNull).subscribe((out: any) => {
      expect(out).toEqual(expect.objectContaining({ result: 'ok', message: null }));
      count++;
      if (count === 2) done();
    });
    i.intercept(ctx, nextUndef).subscribe((out: any) => {
      expect(out).toEqual(expect.objectContaining({ result: 'ok', message: null }));
      count++;
      if (count === 2) done();
    });
  });

  it('wraps boolean values', (done) => {
    const i = new ResponseInterceptor();
    const ctx: any = { switchToHttp: () => ({ getResponse: () => ({ setHeader: jest.fn() }), getRequest: () => ({ traceId: 't' }) }) };
    const nextTrue: any = { handle: () => of(true) };
    const nextFalse: any = { handle: () => of(false) };
    let count = 0;
    i.intercept(ctx, nextTrue).subscribe((out: any) => {
      expect(out).toEqual(expect.objectContaining({ result: 'ok', data: true }));
      count++;
      if (count === 2) done();
    });
    i.intercept(ctx, nextFalse).subscribe((out: any) => {
      expect(out).toEqual(expect.objectContaining({ result: 'ok', data: false }));
      count++;
      if (count === 2) done();
    });
  });
});
