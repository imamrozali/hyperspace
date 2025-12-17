import { db } from '../../shared/database';
import { users, userIdentifiers } from '../../shared/database/schema';
import { eq, and } from 'drizzle-orm';

export class UserRepository {
  async createUser() {
    const [user] = await db.insert(users).values({}).returning({ id: users.id });
    return user;
  }

  async createUserIdentifier(userId: string, type: string, value: string, verified = false) {
    const [identifier] = await db.insert(userIdentifiers).values({ userId, type, value, verified }).returning();
    return identifier;
  }

  async findUserByIdentifier(type: string, value: string) {
    const [user] = await db
      .select({ user: users, identifier: userIdentifiers })
      .from(users)
      .innerJoin(userIdentifiers, eq(users.id, userIdentifiers.userId))
      .where(and(eq(userIdentifiers.type, type), eq(userIdentifiers.value, value)))
      .limit(1);
    return user;
  }

  async findUserIdentifiers(userId: string, type: string) {
    return await db.select().from(userIdentifiers).where(and(eq(userIdentifiers.userId, userId), eq(userIdentifiers.type, type)));
  }
}