import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateQuantitySchema } from '@/lib/validation/collection';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = updateQuantitySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { cardId, quantity } = parsed.data;

    const { count } = await prisma.userCollection.updateMany({
      where: { userId: session.user.id, cardId },
      data: { quantity },
    });

    if (count === 0) {
      return NextResponse.json({ error: 'Carte absente de la collection' }, { status: 404 });
    }

    return NextResponse.json({ cardId, quantity });
  } catch (error) {
    console.error('Error updating quantity:', error);
    return NextResponse.json({ error: 'Impossible de modifier la quantité' }, { status: 500 });
  }
}
