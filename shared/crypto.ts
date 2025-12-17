import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

const key = process.env.ENCRYPTION_KEY;
if (!key) throw new Error('ENCRYPTION_KEY not set');

const encryptionKey = crypto.scryptSync(key, 'salt', 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = (crypto as any).createCipherGCM(ALGORITHM, encryptionKey);
  (cipher as any).setIV(iv);
  cipher.setAAD(Buffer.from('login_payload'));
  const encrypted = Buffer.concat([cipher.update(Buffer.from(text, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + tag.toString('hex');
}

export function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted data');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = Buffer.from(parts[1], 'hex');
  const tag = Buffer.from(parts[2], 'hex');
  const decipher = (crypto as any).createDecipherGCM(ALGORITHM, encryptionKey);
  (decipher as any).setIV(iv);
  decipher.setAAD(Buffer.from('login_payload'));
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString('utf8');
}