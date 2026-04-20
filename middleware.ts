import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only redirect on the production ZIBARASTUDIO domains
  if (!['zibarastudio.com', 'www.zibarastudio.com'].includes(request.nextUrl.hostname)) {
    return NextResponse.next();
  }

  // Check if the request is HTTP (not HTTPS)
  // Check x-forwarded-proto header (set by most hosting platforms)
  const forwardedProto = request.headers.get('x-forwarded-proto');
  // Also check the URL protocol as fallback
  const urlProtocol = request.nextUrl.protocol;
  
  // If HTTP, redirect to HTTPS
  if (forwardedProto === 'http' || urlProtocol === 'http:') {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 301); // 301 permanent redirect for SEO
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
