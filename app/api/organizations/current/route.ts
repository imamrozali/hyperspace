import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/auth';
import { UserRepository } from '@/server/users';
import { SessionRepository } from '@/server/sessions';
import { OrganizationRepository } from '@/server/organizations';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const orgRepo = new OrganizationRepository();
const authService = new AuthService(userRepo, sessionRepo, orgRepo);
const organizationRepo = new OrganizationRepository();

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session_app')?.value;

  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await authService.checkSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { organizationId } = await organizationRepo.getUserActiveOrganization(session.userId);

    // Get organization details
    const organization = await organizationRepo.getOrganizationById(organizationId);

    // Create a stream for the response
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(organization)));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' },
    });
   } catch {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: 'Organization not found' })));
        controller.close();
      },
    });

    return new Response(stream, {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}