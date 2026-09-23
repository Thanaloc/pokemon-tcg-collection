import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// RGPD right of access / portability: everything we store about the user.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        collections: {
          orderBy: { addedAt: 'asc' },
          select: {
            quantity: true,
            addedAt: true,
            card: {
              select: {
                id: true, name: true, number: true, rarity: true,
                set: { select: { name: true, series: true } },
                price: { select: { cardmarketPrice: true } },
              },
            },
          },
        },
        pinnedCards: {
          orderBy: { pinnedAt: 'asc' },
          select: { pinnedAt: true, card: { select: { id: true, name: true } } },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      collection: user.collections.map(item => ({
        cardId: item.card.id,
        name: item.card.name,
        number: item.card.number,
        rarity: item.card.rarity,
        set: item.card.set.name,
        series: item.card.set.series,
        quantity: item.quantity,
        cardmarketPrice: item.card.price?.cardmarketPrice ?? null,
        addedAt: item.addedAt,
      })),
      pinnedCards: user.pinnedCards.map(pin => ({
        cardId: pin.card.id,
        name: pin.card.name,
        pinnedAt: pin.pinnedAt,
      })),
    };

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="pokemon-tcg-collection-${date}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
