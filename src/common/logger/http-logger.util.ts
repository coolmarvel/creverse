import { Injectable, NestMiddleware } from '@nestjs/common';
import { logInfo } from './winston.logger';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const t0 = Date.now();
    const end = res.end;

    res.end = function (...args: any[]) {
      const rt = Date.now() - t0;

      try {
        req.log?.info?.({ method: req.method, url: req.url, status: res.statusCode, responseTime: rt }, 'request completed');
      } catch {
        /* noop */
      }
      try {
        logInfo('request completed', { method: req.method, url: req.url, status: res.statusCode, responseTime: rt });
      } catch {
        /* noop */
      }

      return end.apply(this, args as any);
    } as any;

    next();
  }
}
