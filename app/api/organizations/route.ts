import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/database';
import { organizations, organizationUnits, subscriptions, roles, permissions, rolePermissions, userOrganizations, userOrganizationUnits } from '@/shared/database/schema';
import { eq, inArray } from 'drizzle-orm';
import { AuthService } from '@/server/auth';
import { UserRepository } from '@/server/users';
import { SessionRepository } from '@/server/sessions';
import { OrganizationRepository } from '@/server/organizations';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const orgRepo = new OrganizationRepository();
const authService = new AuthService(userRepo, sessionRepo, orgRepo);

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_app')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await authService.checkSession(sessionId);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const userOrganizationsList = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        ownerId: organizations.ownerId,
        createdAt: organizations.createdAt,
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, session.userId));

    return NextResponse.json(userOrganizationsList);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_app')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await authService.checkSession(sessionId);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    const userId = session.userId;

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Organization name required' }, { status: 400 });

    // Check subscription limit (simplified, assume free allows 1 organization per user)
    const userOrganizationCount = await db
      .select()
      .from(userOrganizations)
      .where(eq(userOrganizations.userId, userId));

    if (userOrganizationCount.length >= 1) { // free plan
      return NextResponse.json({ error: 'Subscription limit reached' }, { status: 403 });
    }

    // Create organization
    const [organization] = await db.insert(organizations).values({ name, ownerId: userId }).returning({ id: organizations.id });

    // Create default organization unit
    const [organizationUnit] = await db.insert(organizationUnits).values({ organizationId: organization.id, name: 'Main Unit' }).returning({ id: organizationUnits.id });

    // Create free subscription
    await db.insert(subscriptions).values({ organizationId: organization.id, plan: 'free' });

    // Create owner role
    const ownerPermissions = ['organization.view', 'organization.manage', 'organization_unit.view', 'organization_unit.manage', 'user.invite', 'billing.manage'];
    const permRecords = await db.select().from(permissions).where(inArray(permissions.code, ownerPermissions));
    if (permRecords.length < ownerPermissions.length) {
      // Insert missing
      const existingCodes = permRecords.map(p => p.code);
      const missing = ownerPermissions.filter(c => !existingCodes.includes(c));
      await db.insert(permissions).values(missing.map(code => ({ code })));
      permRecords.push(...await db.select().from(permissions).where(inArray(permissions.code, missing)));
    }
    const permIds = permRecords.map(p => p.id);

    const [ownerRole] = await db.insert(roles).values({ organizationId: organization.id, name: 'Owner', isOwner: true }).returning({ id: roles.id });

    await db.insert(rolePermissions).values(permIds.map(permId => ({ roleId: ownerRole.id, permissionId: permId })));

    // Assign user to organization and organization unit
    await db.insert(userOrganizations).values({ userId, organizationId: organization.id, roleId: ownerRole.id });
    await db.insert(userOrganizationUnits).values({ userId, organizationUnitId: organizationUnit.id });

    return NextResponse.json({ id: organization.id, name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}