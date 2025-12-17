import { db } from './index';
import bcrypt from 'bcrypt';
import { inArray } from 'drizzle-orm';
import {
  users,
  userIdentifiers,
  organizations,
  organizationUnits,
  roles,
  permissions,
  rolePermissions,
  subscriptions,
  userOrganizations,
  userOrganizationUnits,
} from './schema';

const TOTAL_USERS = 300;
const START_INDEX = 301;

async function seed() {
  console.log('🌱 Seeding database...');

  const endIndex = START_INDEX + TOTAL_USERS - 1;

  console.log(`Starting from index ${START_INDEX}, seeding ${TOTAL_USERS} users.`);

  // Seed permissions once using onConflictDoNothing for idempotency
  const defaultPermissions = [
    'organization.view',
    'organization.manage',
    'organization_unit.view',
    'organization_unit.manage',
    'user.invite',
    'billing.manage',
  ];

  for (const code of defaultPermissions) {
    await db.insert(permissions).values({ code }).onConflictDoNothing();
  }

  const permRecords = await db
    .select()
    .from(permissions)
    .where(inArray(permissions.code, defaultPermissions));

  // Hash password once and reuse for all users
  const passwordHash = await bcrypt.hash('P@ssw0rd', 12);

  for (let i = START_INDEX; i <= endIndex; i++) {
    const currentProgress = i - START_INDEX + 1;
    console.log(`🌱 Seeding user ${currentProgress}/${TOTAL_USERS} (index=${i}, email=user${i}@example.com)...`);

    // Seed user
    const [user] = await db.insert(users).values({}).returning();

    // Seed user identifiers (email, username, password)
    await db.insert(userIdentifiers).values([
      { userId: user.id, type: 'email', value: `user${i}@example.com`, verified: true },
      { userId: user.id, type: 'username', value: `user${i}`, verified: true },
      { userId: user.id, type: 'password', value: passwordHash, verified: true },
    ]);

    // Seed organization
    const [organization] = await db
      .insert(organizations)
      .values({ name: `Organization ${i}`, ownerId: user.id })
      .returning();

    // Seed subscription
    await db.insert(subscriptions).values({
      organizationId: organization.id,
      plan: 'free',
    });

    // Seed organization unit
    const [organizationUnit] = await db
      .insert(organizationUnits)
      .values({
        organizationId: organization.id,
        name: 'Main Unit',
      })
      .returning();

    // Seed role (owner role per organization)
    const [role] = await db
      .insert(roles)
      .values({
        organizationId: organization.id,
        name: 'Owner',
        isOwner: true,
      })
      .returning();

    // Seed role permissions
    await db.insert(rolePermissions).values(
      permRecords.map((p) => ({
        roleId: role.id,
        permissionId: p.id,
      }))
    );

    // Seed user organization
    await db.insert(userOrganizations).values({
      userId: user.id,
      organizationId: organization.id,
      roleId: role.id,
    });

    // Seed user organization unit
    await db.insert(userOrganizationUnits).values({
      userId: user.id,
      organizationUnitId: organizationUnit.id,
    });
  }

  console.log('🎉 Seeding complete!');
  console.log(
    `Users: user${START_INDEX}@example.com to user${endIndex}@example.com / P@ssw0rd`
  );

  process.exit(0);
}

seed().catch(console.error);
