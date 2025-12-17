import { UserRepository } from '../users/user.repository';
import { SessionRepository } from '../sessions/session.repository';
import { OrganizationRepository } from '../organizations/organization.repository';
import bcrypt from 'bcrypt';

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository,
    private organizationRepo: OrganizationRepository,
  ) {}

  async register(email: string, username: string, password: string, organizationName: string) {
    const existingEmail = await this.userRepo.findUserByIdentifier('email', email);
    const existingUsername = await this.userRepo.findUserByIdentifier('username', username);
    if (existingEmail || existingUsername) {
      throw new Error('User already exists');
    }

    const user = await this.userRepo.createUser();
    const hash = await bcrypt.hash(password, 12);
    await this.userRepo.createUserIdentifier(user.id, 'email', email, false);
    await this.userRepo.createUserIdentifier(user.id, 'username', username, false);
    await this.userRepo.createUserIdentifier(user.id, 'password', hash, true);

    const { organization } = await this.organizationRepo.createOrganizationWithDefaults(user.id, organizationName);

    // Create session
    const { sessionId } = await this.sessionRepo.createSession(user.id);

    return { sessionId, user: { id: user.id, activeOrganizationId: organization.id } };
  }

  async login(identifier: string, password: string) {
    const user = await this.userRepo.findUserByIdentifier('email', identifier) ||
                  await this.userRepo.findUserByIdentifier('username', identifier);
    if (!user) throw new Error('Invalid credentials');

    const passwordIds = await this.userRepo.findUserIdentifiers(user.user.id, 'password');
    if (!passwordIds.length || !(await bcrypt.compare(password, passwordIds[0].value))) {
      throw new Error('Invalid credentials');
    }

    // Delete old sessions for the user
    await this.sessionRepo.deleteSessionsByUserId(user.user.id);

    const { sessionId } = await this.sessionRepo.createSession(user.user.id);

    const { organizationId } = await this.organizationRepo.getUserActiveOrganization(user.user.id);

    return { sessionId, user: { id: user.user.id, activeOrganizationId: organizationId } };
  }

  async logout(sessionId: string) {
    await this.sessionRepo.deleteSessionById(sessionId);
  }

  async checkSession(sessionId: string) {
    const session = await this.sessionRepo.getSessionById(sessionId);
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }
    return session;
  }
}