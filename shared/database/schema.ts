import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/* =========================
   USERS
========================= */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: text('status').default('active').notNull(), // active | suspended
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* =========================
   USER IDENTIFIERS
========================= */
export const userIdentifiers = pgTable(
  'user_identifiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: text('type').notNull(), // email | username | password
    value: text('value').notNull(),
    verified: boolean('verified').default(false).notNull(),
  },
  (t) => ({
    uniqEmail: uniqueIndex('user_identifiers_email_unique').on(t.value).where(sql`${t.type} = 'email'`),
    uniqUsername: uniqueIndex('user_identifiers_username_unique').on(t.value).where(sql`${t.type} = 'username'`),
    userIdx: index().on(t.userId),
  })
);

/* =========================
    ORGANIZATIONS
========================= */
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    ownerId: uuid('owner_id').references(() => users.id).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqOwnerOrganization: uniqueIndex().on(t.ownerId, t.name),
  })
);

/* =========================
    ORGANIZATION UNITS
========================= */
export const organizationUnits = pgTable(
  'organization_units',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (t) => ({
    uniqOrganizationUnit: uniqueIndex().on(t.organizationId, t.name),
  })
);

/* =========================
    ROLES
========================= */
export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    isOwner: boolean('is_owner').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (t) => ({
    uniqOrganizationRole: uniqueIndex().on(t.organizationId, t.name),
  })
);

/* =========================
    USER ↔ ORGANIZATION
========================= */
export const userOrganizations = pgTable(
  'user_organizations',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: uuid('role_id').references(() => roles.id).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.organizationId] }),
    userIdx: index().on(t.userId),
    organizationIdx: index().on(t.organizationId),
  })
);

/* =========================
    USER ↔ ORGANIZATION UNIT
========================= */
export const userOrganizationUnits = pgTable(
  'user_organization_units',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    organizationUnitId: uuid('organization_unit_id')
      .references(() => organizationUnits.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.organizationUnitId] }),
    userIdx: index().on(t.userId),
    organizationUnitIdx: index().on(t.organizationUnitId),
  })
);

/* =========================
   PERMISSIONS
========================= */
export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull(),
  },
  (t) => ({
    uniqCode: uniqueIndex().on(t.code),
  })
);

/* =========================
   ROLE ↔ PERMISSIONS
========================= */
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    permissionId: uuid('permission_id')
      .references(() => permissions.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  })
);

/* =========================
    SUBSCRIPTIONS
========================= */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  plan: text('plan').notNull(), // free | pro | enterprise
  expiresAt: timestamp('expires_at'),
});

/* =========================
   SESSIONS (SECURE)
========================= */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    tokenHash: text('token_hash').notNull(),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    refreshExpiresAt: timestamp('refresh_expires_at').notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqToken: uniqueIndex().on(t.tokenHash),
    uniqRefresh: uniqueIndex().on(t.refreshTokenHash),
  })
);

/* =========================
   RELATIONS
========================= */
export const usersRelations = relations(users, ({ many }) => ({
  identifiers: many(userIdentifiers),
  organizations: many(userOrganizations),
  organizationUnits: many(userOrganizationUnits),
  sessions: many(sessions),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, { fields: [organizations.ownerId], references: [users.id] }),
  organizationUnits: many(organizationUnits),
  members: many(userOrganizations),
  roles: many(roles),
  subscriptions: many(subscriptions),
}));

export const organizationUnitsRelations = relations(organizationUnits, ({ one, many }) => ({
  organization: one(organizations, { fields: [organizationUnits.organizationId], references: [organizations.id] }),
  users: many(userOrganizationUnits),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, { fields: [roles.organizationId], references: [organizations.id] }),
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const userOrganizationsRelations = relations(userOrganizations, ({ one }) => ({
  user: one(users, { fields: [userOrganizations.userId], references: [users.id] }),
  organization: one(organizations, { fields: [userOrganizations.organizationId], references: [organizations.id] }),
  role: one(roles, { fields: [userOrganizations.roleId], references: [roles.id] }),
}));

export const userOrganizationUnitsRelations = relations(userOrganizationUnits, ({ one }) => ({
  user: one(users, { fields: [userOrganizationUnits.userId], references: [users.id] }),
  organizationUnit: one(organizationUnits, { fields: [userOrganizationUnits.organizationUnitId], references: [organizationUnits.id] }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, { fields: [subscriptions.organizationId], references: [organizations.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const userIdentifiersRelations = relations(userIdentifiers, ({ one }) => ({
  user: one(users, { fields: [userIdentifiers.userId], references: [users.id] }),
}));
