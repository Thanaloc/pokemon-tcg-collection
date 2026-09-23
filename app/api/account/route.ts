import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { accountLimit, tooManyRequests } from '@/lib/ratelimit';
import { deleteAccountSchema, firstIssue, updateProfileSchema } from '@/lib/validation/auth';

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = updateProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(firstIssue(parsed.error), { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name ?? null },
      select: { name: true },
    });
    return NextResponse.json({ name: user.name });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { success, reset } = await accountLimit.limit(session.user.id);
  if (!success) return tooManyRequests(reset);

  const parsed = deleteAccountSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(firstIssue(parsed.error), { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return NextResponse.json({ error: 'Mot de passe incorrect', field: 'password' }, { status: 400 });
    }

    // Collection, pins and email tokens cascade.
    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
