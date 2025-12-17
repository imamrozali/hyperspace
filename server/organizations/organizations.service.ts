import { OrganizationRepository } from './organization.repository';
import { RoleRepository } from '../roles/role.repository';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { OrganizationUnitsRepository } from './organization-units.repository';

export class OrganizationsService {
  constructor(
    private organizationRepo: OrganizationRepository,
    private roleRepo: RoleRepository,
    private subRepo: SubscriptionRepository,
    private orgUnitsRepo: OrganizationUnitsRepository,
  ) {}

  async switchOrganization(userId: string, newOrganizationId: string) {
    return await this.organizationRepo.switchOrganization(userId, newOrganizationId);
  }

  async createOrganizationUnit(userId: string, organizationId: string, name: string) {
    return await this.organizationRepo.createOrganizationUnit(organizationId, name);
  }

  async assignUserToOrganizationUnit(userId: string, organizationUnitId: string, targetUserId: string) {
    await this.organizationRepo.assignUserToOrganizationUnit(targetUserId, organizationUnitId);
  }

  async transferOwnership(userId: string, organizationId: string, newOwnerId: string) {
    const organization = await this.organizationRepo.getOrganizationById(organizationId);
    if (organization.ownerId !== userId) {
      throw new Error('Only owner can transfer ownership');
    }
    await this.organizationRepo.transferOwnership(organizationId, newOwnerId);
  }

  async getCurrentOrganization(userId: string) {
    return this.organizationRepo.getUserActiveOrganization(userId);
  }

  async getOrganizationUnits(organizationId: string) {
    return this.orgUnitsRepo.getOrganizationUnits(organizationId);
  }

  async getCurrentOrganizationUnit(userId: string) {
    return this.orgUnitsRepo.getUserActiveOrganizationUnit(userId);
  }
}