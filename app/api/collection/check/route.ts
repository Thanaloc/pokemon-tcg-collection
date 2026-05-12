import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ owned: {} });
    }

    const body = await request.json().catch(() => null);
    const cardIds: string[] = Array.isArray(body?.cardIds)
      ? body.cardIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];

    if (cardIds.length === 0) {
      return NextResponse.json({ owned: {} });
    }

    const collections = await prisma.userCollection.findMany({
      where: {
        userId: session.user.id,
        cardId: { in: cardIds },
      },
      select: {
        cardId: true,
        quantity: true,
      },
    });

    const owned: Record<string, number> = {};
    for (const item of collections) {
      owned[item.cardId] = item.quantity;
    }

    return NextResponse.json({ owned });
  } catch (error) {
    console.error('Error checking ownership:', error);
    return NextResponse.json({ owned: {} });
  }
}