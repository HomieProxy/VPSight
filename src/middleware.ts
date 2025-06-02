
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/app/admin/actions';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
    if (!sessionCookie || sessionCookie.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      // Add a redirect query parameter if trying to access a specific admin page
      if (pathname !== '/admin/dashboard') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
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
     * - install_agent.sh (agent script)
     * - images (public images folder if you have one)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|install_agent.sh|images).*)',
  ],
};
