import { NextRequest, NextResponse } from 'next/server';
import { AuthService, UserRepository, SessionRepository, OrganizationRepository } from './server';
import crypto from 'crypto';

const authService = new AuthService(
  new UserRepository(),
  new SessionRepository(),
  new OrganizationRepository()
);

const PUBLIC_FILE = /\.(.*)$/;

function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

function buildCSP(nonce: string): string {
  return `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-eval'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;`;
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  const nonce = generateNonce();
  const csp = buildCSP(nonce);
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('x-nonce', nonce);
  return res;
}

async function handleAuth(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (pathname !== '/login') {
    return null;
  }

  if (!process.env.JWT_SECRET) {
    return applySecurityHeaders(NextResponse.next());
  }

  const sessionCookie = request.cookies.get('session_app')?.value;
  if (!sessionCookie) {
    return applySecurityHeaders(NextResponse.next());
  }

  try {
    const session = await authService.checkSession(sessionCookie);
    if (session?.userId) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/dashboard', request.nextUrl))
      );
    }
  } catch (error) {
    console.error('Session check failed:', error);
    const res = NextResponse.next();
    res.cookies.delete('session_app');
    return applySecurityHeaders(res);
  }

  return null; 
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = request.nextUrl;

  if (
    searchParams.has('_rsc') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  const authResponse = await handleAuth(request);
  if (authResponse) {
    return authResponse;
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};