import { db } from '../../shared/database';
import { organizations, organizationUnits, subscriptions, roles, permissions, rolePermissions, userOrganizations, userOrganizationUnits } from '../../shared/database/schema';
import { eq, and, inArray } from 'drizzle-orm';

export class OrganizationRepository {
  async createOrganizationWithDefaults(ownerId: string, organizationName: string) {
    const [organization] = await db.insert(organizations).values({ name: organizationName, ownerId }).returning();
    const [organizationUnit] = await db.insert(organizationUnits).values({ organizationId: organization.id, name: 'Main Unit' }).returning();
    await db.insert(subscriptions).values({ organizationId: organization.id, plan: 'free' });

    const ownerPerms = ['organization.view', 'organization.manage', 'organization_unit.view', 'organization_unit.manage', 'user.invite', 'billing.manage'];
    await db.insert(permissions).values(ownerPerms.map(code => ({ code }))).onConflictDoNothing();

    const permRecords = await db.select().from(permissions).where(inArray(permissions.code, ownerPerms));
    const permIds = permRecords.map(p => p.id);

    const [role] = await db.insert(roles).values({ organizationId: organization.id, name: 'Owner', isOwner: true }).returning();
    await db.insert(rolePermissions).values(permIds.map(id => ({ roleId: role.id, permissionId: id })));

    await db.insert(userOrganizations).values({ userId: ownerId, organizationId: organization.id, roleId: role.id });
    await db.insert(userOrganizationUnits).values({ userId: ownerId, organizationUnitId: organizationUnit.id });

    return { organization, organizationUnit, role, organizationUnitIds: [organizationUnit.id] };
  }

  async getOrganizationById(organizationId: string) {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    return organization;
  }

  async getUserActiveOrganization(userId: string) {
    const userOrganization = await db.select().from(userOrganizations).where(eq(userOrganizations.userId, userId)).limit(1);
    if (!userOrganization.length) throw new Error('No organization assigned');

    const organizationId = userOrganization[0].organizationId;
    const roleId = userOrganization[0].roleId;

    const userOrganizationUnitRecords = await db
      .select({ organizationUnitId: userOrganizationUnits.organizationUnitId })
      .from(userOrganizationUnits)
      .innerJoin(organizationUnits, eq(userOrganizationUnits.organizationUnitId, organizationUnits.id))
      .where(and(eq(userOrganizationUnits.userId, userId), eq(organizationUnits.organizationId, organizationId)));

    const organizationUnitIds = userOrganizationUnitRecords.map(uou => uou.organizationUnitId);

    return { organizationId, roleId, organizationUnitIds };
  }

  async switchOrganization(userId: string, newOrganizationId: string) {
    const userOrganization = await db
      .select()
      .from(userOrganizations)
      .where(and(eq(userOrganizations.userId, userId), eq(userOrganizations.organizationId, newOrganizationId)))
      .limit(1);
    if (!userOrganization.length) throw new Error('Access denied');

    const roleId = userOrganization[0].roleId;

    const userOrganizationUnitRecords = await db
      .select({ organizationUnitId: userOrganizationUnits.organizationUnitId })
      .from(userOrganizationUnits)
      .innerJoin(organizationUnits, eq(userOrganizationUnits.organizationUnitId, organizationUnits.id))
      .where(and(eq(userOrganizationUnits.userId, userId), eq(organizationUnits.organizationId, newOrganizationId)));

    const organizationUnitIds = userOrganizationUnitRecords.map(uou => uou.organizationUnitId);

    return { organizationId: newOrganizationId, roleId, organizationUnitIds };
  }

  async createOrganizationUnit(organizationId: string, name: string) {
    const [organizationUnit] = await db.insert(organizationUnits).values({ organizationId, name }).returning();
    return organizationUnit;
  }

  async assignUserToOrganizationUnit(userId: string, organizationUnitId: string) {
    await db.insert(userOrganizationUnits).values({ userId, organizationUnitId }).onConflictDoNothing();
  }

  async transferOwnership(organizationId: string, newOwnerId: string) {
    await db.update(organizations).set({ ownerId: newOwnerId }).where(eq(organizations.id, organizationId));
    // Update role to owner for new owner
    const [ownerRole] = await db.select().from(roles).where(and(eq(roles.organizationId, organizationId), eq(roles.isOwner, true))).limit(1);
    if (ownerRole) {
      await db.update(userOrganizations).set({ roleId: ownerRole.id }).where(and(eq(userOrganizations.userId, newOwnerId), eq(userOrganizations.organizationId, organizationId)));
    }
  }
}