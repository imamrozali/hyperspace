import { db } from '../../shared/database';
import { organizationUnits } from '../../shared/database/schema';
import { eq } from 'drizzle-orm';

export class OrganizationUnitsRepository {
  async getOrganizationUnits(organizationId: string) {
    return await db.select().from(organizationUnits).where(eq(organizationUnits.organizationId, organizationId));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserActiveOrganizationUnit(_userId: string) {
    // Implement logic to get active unit for user
    // For now, return first unit of active organization
    // This needs to be implemented properly
    return null;
  }
}