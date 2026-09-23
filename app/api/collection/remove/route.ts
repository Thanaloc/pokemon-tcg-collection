import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cardIdSchema } from '@/lib/validation/collection';

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = cardIdSchema.safeParse(searchParams.get('cardId'));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Carte invalide' }, { status: 400 });
    }

    const { count } = await prisma.userCollection.deleteMany({
      where: { userId: session.user.id, cardId: parsed.data },
    });

    if (count === 0) {
      return NextResponse.json({ error: 'Carte absente de la collection' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error removing card:', error);
    return NextResponse.json({ error: 'Impossible de retirer la carte' }, { status: 500 });
  }
}
