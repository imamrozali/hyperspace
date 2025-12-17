import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface SessionPayload extends JWTPayload {
  uid: string;
  bid?: string; // brand_id
  rid?: string; // role_id
  bids?: string[]; // branch_ids
}

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET is not set');

const key = new TextEncoder().encode(secret);
const ALG = 'HS256';
const TOKEN_TTL = '24h';

export function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(key);
}

export async function verifySession(
  token?: string
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, key, {
      algorithms: [ALG],
    });

    return payload;
  } catch {
    return null;
  }
}