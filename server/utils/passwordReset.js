import crypto from 'crypto';

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 45 * 60 * 1000; // 45 minutes

export function createResetToken() {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const tokenHash = hashResetToken(token);
  const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  return { token, tokenHash, expires };
}

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
