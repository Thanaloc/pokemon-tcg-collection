import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

// Single-use tokens sent by email. Only a SHA-256 of the token is stored, so a
// database leak doesn't hand out working reset links.

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function issueVerificationToken(email: string): Promise<string> {
  const token = newToken();
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { email } }),
    prisma.verificationToken.create({
      data: { email, token: hashToken(token), expires: new Date(Date.now() + VERIFICATION_TTL_MS) },
    }),
  ]);
  return token;
}

/** Returns the email the token was issued for, or null if invalid/expired/used. */
export async function consumeVerificationToken(token: string): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token: hashToken(token) } });
  if (!record) return null;
  // deleteMany + count makes concurrent uses of the same token lose the race.
  const { count } = await prisma.verificationToken.deleteMany({ where: { id: record.id } });
  return count === 1 && record.expires > new Date() ? record.email : null;
}

export async function issuePasswordResetToken(email: string): Promise<string> {
  const token = newToken();
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { email } }),
    prisma.passwordResetToken.create({
      data: { email, token: hashToken(token), expires: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
    }),
  ]);
  return token;
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token: hashToken(token) } });
  if (!record) return null;
  const { count } = await prisma.passwordResetToken.deleteMany({ where: { id: record.id } });
  return count === 1 && record.expires > new Date() ? record.email : null;
}

/** Base URL used in email links. Never derived from the Host header in production. */
export function getAppUrl(request: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return new URL(request.url).origin;
}
