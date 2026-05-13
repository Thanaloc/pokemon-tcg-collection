import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { buildCardmarketUrl } from '@/lib/cardmarket';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pins = await prisma.pinnedCard.findMany({
      where: { userId: session.user.id },
      include: {
        card: {
          include: {
            set: true,
            pokemon: true,
            price: true,
          },
        },
      },
      orderBy: { pinnedAt: 'desc' },
    });

        const formatted = pins.map((p: any) => ({
    id: p.id,
    pinnedAt: p.pinnedAt,
    card: {
      id: p.card.id,
      name: p.card.name,
      number: p.card.number,
      set: p.card.set.name,
      smallImage: p.card.imageSmallFr || p.card.imageSmallEn,
      currentPrice: p.card.price?.cardmarketPrice || null,
      cardmarketUrl: buildCardmarketUrl({
        name: p.card.name,
        number: p.card.number,
      }),
    },
  }));

    return NextResponse.json({ pins: formatted });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const cardId = typeof body?.cardId === 'string' ? body.cardId : null;
    if (!cardId) {
      return NextResponse.json({ error: 'Missing cardId' }, { status: 400 });
    }

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const pin = await prisma.pinnedCard.upsert({
      where: { userId_cardId: { userId: session.user.id, cardId } },
      create: { userId: session.user.id, cardId },
      update: {},
    });

    return NextResponse.json({ pin });
  } catch (error) {
    console.error('Error creating pin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    if (!cardId) {
      return NextResponse.json({ error: 'Missing cardId' }, { status: 400 });
    }

    await prisma.pinnedCard.deleteMany({
      where: { userId: session.user.id, cardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}