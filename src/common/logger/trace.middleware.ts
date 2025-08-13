import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const headerKey = 'x-trace-id';
    const traceId = req.headers[headerKey] || randomUUID();

    req.traceId = traceId;
    res.setHeader(headerKey, traceId);
    next();
  }
}
