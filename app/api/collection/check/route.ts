import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ owned: {} });
    }

    const { searchParams } = new URL(request.url);
    const cardIds = searchParams.get('cardIds')?.split(',') || [];

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
    collections.forEach((item: any) => {
      owned[item.cardId] = item.quantity;
    });

    return NextResponse.json({ owned });
  } catch (error: any) {
    console.error('Error checking ownership:', error);
    return NextResponse.json({ owned: {} });
  }
}