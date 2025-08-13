import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp();
    const res: any = http.getResponse?.();
    const req: any = http.getRequest?.();
    const started = Date.now();

    return next.handle().pipe(
      map((data) => {
        const apiLatency = Date.now() - started;

        if (req?.traceId && res?.setHeader) res.setHeader('x-trace-id', req?.traceId);

        if (data && typeof data === 'object' && 'result' in data) return data;
        if (data === null || typeof data === 'undefined') return { result: 'ok', message: null, apiLatency };
        if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') return { result: 'ok', message: null, data, apiLatency };

        return { result: 'ok', message: null, apiLatency, ...data };
      }),
    );
  }
}
