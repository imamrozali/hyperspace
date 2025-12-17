import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/auth';
import { UserRepository } from '@/server/users';
import { SessionRepository } from '@/server/sessions';
import { OrganizationRepository } from '@/server/organizations';
import { db } from '@/shared/database';
import { organizationUnits, userOrganizationUnits } from '@/shared/database/schema';
import { eq } from 'drizzle-orm';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const orgRepo = new OrganizationRepository();
const authService = new AuthService(userRepo, sessionRepo, orgRepo);

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
    // Get user's organization units
    const userOrganizationUnitRecords = await db
      .select()
      .from(userOrganizationUnits)
      .innerJoin(organizationUnits, eq(userOrganizationUnits.organizationUnitId, organizationUnits.id))
      .where(eq(userOrganizationUnits.userId, session.userId));

    if (!userOrganizationUnitRecords.length) {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: 'No organization unit assigned' })));
          controller.close();
        },
      });

      return new Response(stream, {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return the first organization unit as current
    const currentOrganizationUnit = userOrganizationUnitRecords[0].organization_units;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(currentOrganizationUnit)));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' },
    });
   } catch {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: 'Organization unit not found' })));
        controller.close();
      },
    });

    return new Response(stream, {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}