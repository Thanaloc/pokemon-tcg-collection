import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { addToCollectionSchema } from '@/lib/validation/collection';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = addToCollectionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Carte invalide' }, { status: 400 });
    }
    const { cardId } = parsed.data;

    const card = await prisma.card.findUnique({ where: { id: cardId }, select: { id: true } });
    if (!card) {
      return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });
    }

    // Atomic: two quick clicks give 2 copies instead of a unique-constraint error.
    const collection = await prisma.userCollection.upsert({
      where: { userId_cardId: { userId: session.user.id, cardId } },
      create: { userId: session.user.id, cardId, quantity: 1 },
      update: { quantity: { increment: 1 } },
    });

    return NextResponse.json({ collection }, { status: collection.quantity === 1 ? 201 : 200 });
  } catch (error) {
    console.error('Error adding card to collection:', error);
    return NextResponse.json({ error: "Impossible d'ajouter la carte" }, { status: 500 });
  }
}
