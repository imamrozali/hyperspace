import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/auth';
import { UserRepository } from '@/server/users';
import { SessionRepository } from '@/server/sessions';
import { OrganizationRepository } from '@/server/organizations';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const orgRepo = new OrganizationRepository();
const authService = new AuthService(userRepo, sessionRepo, orgRepo);

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session_app')?.value;

  if (!sessionId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = await authService.checkSession(sessionId);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, userId: session.userId });
}