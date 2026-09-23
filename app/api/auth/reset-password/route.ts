import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { emailLimit, getClientIp, tooManyRequests } from '@/lib/ratelimit';
import { firstIssue, resetPasswordSchema } from '@/lib/validation/auth';
import { consumePasswordResetToken } from '@/lib/auth-tokens';

export async function POST(request: Request) {
  const { success, reset } = await emailLimit.limit(getClientIp(request));
  if (!success) return tooManyRequests(reset);

  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(firstIssue(parsed.error), { status: 400 });
  }

  try {
    const email = await consumePasswordResetToken(parsed.data.token);
    if (!email) {
      return NextResponse.json(
        { error: 'Ce lien est invalide ou a expiré. Faites une nouvelle demande.' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { emailVerified: true } });
    if (!user) {
      return NextResponse.json({ error: 'Compte introuvable' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        password: await bcrypt.hash(parsed.data.password, 10),
        // Every existing session (a possibly compromised one included) is dropped.
        sessionVersion: { increment: 1 },
        // Receiving the link proves the mailbox belongs to the user.
        emailVerified: user.emailVerified ?? new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
