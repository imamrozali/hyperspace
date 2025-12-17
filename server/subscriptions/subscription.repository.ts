import { db } from '../../shared/database';
import { subscriptions } from '../../shared/database/schema';
import { eq } from 'drizzle-orm';

export class SubscriptionRepository {
  async getSubscription(organizationId: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, organizationId)).limit(1);
    return sub;
  }

  async upgradeSubscription(organizationId: string, plan: string) {
    await db.update(subscriptions).set({ plan }).where(eq(subscriptions.organizationId, organizationId));
  }
}