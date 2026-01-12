import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID required' }, { status: 400 });
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

    await prisma.userCollection.delete({
      where: { id: collection.id },
    });

    return NextResponse.json({
      message: 'Card removed from collection',
    });
  } catch (error: any) {
    console.error('Error removing card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}