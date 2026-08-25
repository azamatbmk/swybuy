import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { REF_COOKIE, REF_DAYS } from './lib/ref';

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref');
  const response = NextResponse.next();
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');

  if (ref) {
    response.cookies.set(REF_COOKIE, ref.toLowerCase().slice(0, 40), {
      maxAge: REF_DAYS * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
