import { NextRequest, NextResponse } from 'next/server';
import { OrganizationRepository } from '@/server/organizations';
import { AuthService } from '@/server/auth';
import { UserRepository } from '@/server/users';
import { SessionRepository } from '@/server/sessions';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const orgRepo = new OrganizationRepository();
const organizationRepo = new OrganizationRepository();
const authService = new AuthService(userRepo, sessionRepo, orgRepo);

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_app')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await authService.checkSession(sessionId);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { organizationId } = await request.json();
    if (!organizationId) return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });

    const result = await organizationRepo.switchOrganization(session.userId, organizationId);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}