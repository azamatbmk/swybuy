import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { REF_COOKIE, REF_DAYS } from './lib/ref';

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref');
  const response = NextResponse.next();

  if (ref) {
    response.cookies.set(REF_COOKIE, ref.toLowerCase(), {
      maxAge: REF_DAYS * 24 * 60 * 60,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
