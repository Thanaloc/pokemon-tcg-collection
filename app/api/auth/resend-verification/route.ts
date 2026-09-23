import { after, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailLimit, getClientIp, tooManyRequests } from '@/lib/ratelimit';
import { emailOnlySchema } from '@/lib/validation/auth';
import { isEmailEnabled, sendEmail, verificationEmail } from '@/lib/email';
import { getAppUrl, issueVerificationToken } from '@/lib/auth-tokens';

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

  if (isEmailEnabled()) {
    after(async () => {
      try {
        const user = await prisma.user.findUnique({ where: { email }, select: { emailVerified: true } });
        if (!user || user.emailVerified) return;
        const token = await issueVerificationToken(email);
        await sendEmail(verificationEmail(email, `${appUrl}/verify-email?token=${token}`));
      } catch (error) {
        console.error('Resend verification failed:', error);
      }
    });
  }

  return NextResponse.json({ ok: true });
}
