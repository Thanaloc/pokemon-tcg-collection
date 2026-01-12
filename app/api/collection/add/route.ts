import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID required' }, { status: 400 });
    }

    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const existingCollection = await prisma.userCollection.findUnique({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId: cardId,
        },
      },
    });

    if (existingCollection) {
      const updated = await prisma.userCollection.update({
        where: { id: existingCollection.id },
        data: { quantity: existingCollection.quantity + 1 },
      });

      return NextResponse.json({
        message: 'Card quantity updated',
        collection: updated,
      });
    }

    const collection = await prisma.userCollection.create({
      data: {
        userId: session.user.id,
        cardId: cardId,
        quantity: 1,
      },
    });

    return NextResponse.json({
      message: 'Card added to collection',
      collection,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding card to collection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}