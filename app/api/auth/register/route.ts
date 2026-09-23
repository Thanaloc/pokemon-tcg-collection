import { after, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerLimit, getClientIp, tooManyRequests } from '@/lib/ratelimit';
import { firstIssue, registerSchema } from '@/lib/validation/auth';
import { accountExistsEmail, isEmailEnabled, sendEmail, verificationEmail } from '@/lib/email';
import { getAppUrl, issueVerificationToken } from '@/lib/auth-tokens';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success, reset } = await registerLimit.limit(ip);
    if (!success) return tooManyRequests(reset);

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(firstIssue(parsed.error), { status: 400 });
    }

    const { email, password, name } = parsed.data;
    const emailEnabled = isEmailEnabled();
    const appUrl = getAppUrl(request);

    // Hash before looking the account up so both paths take the same time.
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Without email we can't reach the owner, so say it plainly (old behavior).
      if (!emailEnabled) {
        return NextResponse.json(
          { error: 'Un compte existe déjà avec cet email', field: 'email' },
          { status: 400 },
        );
      }

      // Same answer as a real signup: the mailbox owner learns what happened.
      after(async () => {
        try {
          if (existingUser.emailVerified) {
            await sendEmail(accountExistsEmail(email, `${appUrl}/login`, `${appUrl}/forgot-password`));
          } else {
            const token = await issueVerificationToken(email);
            await sendEmail(verificationEmail(email, `${appUrl}/verify-email?token=${token}`));
          }
        } catch (error) {
          console.error('Register email (existing account) failed:', error);
        }
      });
      return NextResponse.json({ requiresVerification: true }, { status: 201 });
    }

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? null,
        emailVerified: emailEnabled ? null : new Date(),
      },
    });

    if (emailEnabled) {
      after(async () => {
        try {
          const token = await issueVerificationToken(email);
          await sendEmail(verificationEmail(email, `${appUrl}/verify-email?token=${token}`));
        } catch (error) {
          // The user can ask for a new link from the login page.
          console.error('Verification email failed:', error);
        }
      });
    }

    return NextResponse.json({ requiresVerification: emailEnabled }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
}
