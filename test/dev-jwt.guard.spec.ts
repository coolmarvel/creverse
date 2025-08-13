import { DevJwtGuard } from '../src/common/auth/dev-jwt.guard';

function ctx(url: string, auth?: string): any {
  return { switchToHttp: () => ({ getRequest: () => ({ originalUrl: url, headers: auth ? { authorization: auth } : {} }) }) } as any;
}

describe('DevJwtGuard', () => {
  const cfg: any = { get: (k: string) => (k === 'swagger.jwtBearerToken' ? 'devtoken' : undefined) };

  it('allows whitelisted', () => {
    const g = new DevJwtGuard(cfg);
    expect(g.canActivate(ctx('/v1'))).toBe(true);
    expect(g.canActivate(ctx('/v1/health'))).toBe(true);
    expect(g.canActivate(ctx('/docs'))).toBe(true);
  });
  it('rejects missing auth', () => {
    const g = new DevJwtGuard(cfg);
    expect(() => g.canActivate(ctx('/v1/submissions'))).toThrow('Missing Authorization header');
  });
  it('accepts valid', () => {
    const g = new DevJwtGuard(cfg);
    expect(g.canActivate(ctx('/v1/submissions', 'Bearer devtoken'))).toBe(true);
  });
  it('rejects invalid', () => {
    const g = new DevJwtGuard();
    expect(() => g.canActivate(ctx('/v1/submissions', 'Bearer wrong'))).toThrow('Invalid bearer token');
  });
});
