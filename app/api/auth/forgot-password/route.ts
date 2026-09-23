import { after, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailLimit, getClientIp, tooManyRequests } from '@/lib/ratelimit';
import { emailOnlySchema } from '@/lib/validation/auth';
import { passwordResetEmail, sendEmail } from '@/lib/email';
import { getAppUrl, issuePasswordResetToken } from '@/lib/auth-tokens';

// Always answers the same thing, whether the account exists or not.
export async function POST(request: Request) {
  const { success, reset } = await emailLimit.limit(getClientIp(request));
  if (!success) return tooManyRequests(reset);

  const parsed = emailOnlySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const { email } = parsed.data;
  const appUrl = getAppUrl(request);

  after(async () => {
    try {
      const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (!user) return;
      const token = await issuePasswordResetToken(email);
      await sendEmail(passwordResetEmail(email, `${appUrl}/reset-password?token=${token}`));
    } catch (error) {
      console.error('Password reset email failed:', error);
    }
  });

  return NextResponse.json({ ok: true });
}
