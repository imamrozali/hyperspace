import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../shared/database';
import { sessions } from '../../shared/database/schema';
import { signSession } from '../auth/session';

function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export class SessionRepository {
  async createSession(userId: string) {
    const payload = { uid: userId, bid: undefined, rid: undefined, bids: [] };
    const accessToken = await signSession(payload);
    const refreshToken = await signSession({ ...payload, type: 'refresh' }); // Assume extended expiry

    const tokenHash = await hashString(accessToken);
    const refreshTokenHash = await hashString(refreshToken);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        tokenHash,
        refreshTokenHash,
        expiresAt,
        refreshExpiresAt,
      })
      .returning();

    return { sessionId: session.id, accessToken, refreshToken };
  }

  async getSessionById(sessionId: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));

    return session;
  }

  async deleteSessionById(sessionId: string) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteSessionsByUserId(userId: string) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async validateSession(token: string) {
    const tokenHash = await hashString(token);
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.tokenHash, tokenHash));

    if (!session || session.revokedAt || session.expiresAt < new Date()) return null;

    return session;
  }

  async revokeSession(sessionId: string) {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }
}