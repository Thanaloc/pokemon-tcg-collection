import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { accountLimit, tooManyRequests } from '@/lib/ratelimit';
import { changePasswordSchema, firstIssue } from '@/lib/validation/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { success, reset } = await accountLimit.limit(session.user.id);
  if (!success) return tooManyRequests(reset);

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(firstIssue(parsed.error), { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, password: true },
    });
    if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.password))) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect', field: 'currentPassword' },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          password: await bcrypt.hash(parsed.data.newPassword, 10),
          // Logs out every device, this one included.
          sessionVersion: { increment: 1 },
        },
      }),
      prisma.passwordResetToken.deleteMany({ where: { email: user.email } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
