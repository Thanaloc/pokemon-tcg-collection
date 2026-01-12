import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, quantity } = body;

    if (!cardId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Card ID and quantity required' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    const collection = await prisma.userCollection.findUnique({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId: cardId,
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Card not in collection' }, { status: 404 });
    }

    const updated = await prisma.userCollection.update({
      where: { id: collection.id },
      data: { quantity },
    });

    return NextResponse.json({
      message: 'Quantity updated',
      collection: updated,
    });
  } catch (error: any) {
    console.error('Error updating quantity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}