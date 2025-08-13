import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DevJwtGuard implements CanActivate {
  private readonly devToken: string;

  constructor(private readonly configService?: ConfigService) {
    this.devToken = this.configService?.get<string>('swagger.jwtBearerToken');
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const path: string = req.originalUrl || req.url || '';

    if (path === '/' || path === '/v1' || path.startsWith('/v1/health') || path.startsWith('/docs') || path.startsWith('/docs-json')) {
      return true;
    }

    const auth: string | undefined = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || typeof auth !== 'string') throw new UnauthorizedException('Missing Authorization header');

    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Invalid Authorization header');

    if (token !== this.devToken) throw new UnauthorizedException('Invalid bearer token');
    return true;
  }
}
