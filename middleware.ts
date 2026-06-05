import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COUNTRY_COOKIE } from '@/lib/geo-currency';

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

/**
 * Resolve the visitor's country from edge-provided geo headers (no permission
 * prompt, no client GPS). Vercel, Cloudflare and Netlify each expose this on the
 * request. `x-country` is honored too so it can be forced in local dev/tests.
 */
function getCountry(request: NextRequest): string | null {
  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-country');
  if (!country) return null;
  const code = country.trim().toUpperCase();
  // Cloudflare uses "XX"/"T1" for unknown / Tor; ignore those.
  return /^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1' ? code : null;
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

  const response = NextResponse.next();

  // Surface the detected country to the client (currency auto-selection reads
  // this cookie). Non-HttpOnly so the storefront can read it; refreshed each
  // visit so it tracks the visitor if their location changes.
  const country = getCountry(request);
  if (country && request.cookies.get(COUNTRY_COOKIE)?.value !== country) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
