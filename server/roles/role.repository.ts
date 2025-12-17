import { db } from '../../shared/database';
import { roles, rolePermissions, permissions, userOrganizations } from '../../shared/database/schema';
import { eq, and, inArray } from 'drizzle-orm';

export class RoleRepository {
  async createRole(organizationId: string, name: string, isOwner = false) {
    const [role] = await db.insert(roles).values({ organizationId, name, isOwner }).returning();
    return role;
  }

  async assignPermissionsToRole(roleId: string, permissionCodes: string[]) {
    const permRecords = await db.select().from(permissions).where(inArray(permissions.code, permissionCodes));
    await db.insert(rolePermissions).values(
      permRecords.map(p => ({ roleId, permissionId: p.id }))
    );
  }

  async getRoleById(roleId: string) {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    return role;
  }

  async assignRoleToUser(userId: string, organizationId: string, roleId: string) {
    await db.update(userOrganizations).set({ roleId }).where(and(eq(userOrganizations.userId, userId), eq(userOrganizations.organizationId, organizationId)));
  }

  async getRolesByOrganization(organizationId: string) {
    return await db.select().from(roles).where(eq(roles.organizationId, organizationId));
  }
}