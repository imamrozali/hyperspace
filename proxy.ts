import { NextRequest, NextResponse } from 'next/server';
import { AuthService, UserRepository, SessionRepository, OrganizationRepository } from './server';


const authService = new AuthService(
  new UserRepository(),
  new SessionRepository(),
  new OrganizationRepository()
);

const PUBLIC_FILE = /\.(.*)$/;

export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    searchParams.has('_rsc') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }


  if (pathname === '/login') {
    if (!process.env.JWT_SECRET) return NextResponse.next();

    const sessionCookie = request.cookies.get('session_app')?.value;

    if (!sessionCookie) return NextResponse.next();

    try {
      const session = await authService.checkSession(sessionCookie);

      if (session?.userId) {
        return NextResponse.redirect(
          new URL('/dashboard', request.nextUrl)
        );
      }
    } catch {
      const res = NextResponse.next();
      res.cookies.delete('session_app');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
