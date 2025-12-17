import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/auth';
import { UserRepository } from '@/server/users';
import { SessionRepository } from '@/server/sessions';
import { OrganizationRepository } from '@/server/organizations';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const orgRepo = new OrganizationRepository();
const authService = new AuthService(userRepo, sessionRepo, orgRepo);

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session_app')?.value;

  if (sessionId) {
    await authService.logout(sessionId);
  }

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('session_app', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });

  return response;
}