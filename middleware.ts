import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (per-isolate; good enough for edge protection)
const rateLimitStore = new Map<string, { count: number; reset: number }>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const ip = getIp(request);

  // Rate-limit sensitive public endpoints
  const rateLimitedPaths: Array<{ path: string; limit: number; window: number }> = [
    { path: '/api/orders/track', limit: 10, window: 60_000 },
    { path: '/api/messages', limit: 5, window: 300_000 },
    { path: '/api/auth', limit: 20, window: 60_000 },
    { path: '/api/contact', limit: 5, window: 300_000 },
  ];

  for (const rule of rateLimitedPaths) {
    if (pathname.startsWith(rule.path)) {
      const key = `${rule.path}:${ip}`;
      if (isRateLimited(key, rule.limit, rule.window)) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 },
        );
      }
      break;
    }
  }

  // HTTPS redirect for production domains only
  if (['zibara.store', 'www.zibara.store'].includes(hostname)) {
    const forwardedProto = request.headers.get('x-forwarded-proto');
    if (forwardedProto === 'http' || request.nextUrl.protocol === 'http:') {
      const httpsUrl = request.nextUrl.clone();
      httpsUrl.protocol = 'https:';
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
