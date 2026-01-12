import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      prisma.userCollection.findMany({
        where: { userId: session.user.id },
        include: {
          card: {
            include: {
              set: true,
              price: true,
              pokemon: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userCollection.count({
        where: { userId: session.user.id },
      }),
    ]);

    const formattedCollections = collections.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      addedAt: item.addedAt,
      card: {
        id: item.card.id,
        name: item.card.name,
        number: item.card.number,
        rarity: item.card.rarity,
        image: item.card.imageFr || item.card.imageEn || 'placeholder-card.png',
        smallImage: item.card.imageSmallFr || item.card.imageSmallEn || 'placeholder-card.png',
        set: item.card.set.name,
        series: item.card.set.series,
        price: item.card.price?.cardmarketPrice || null,
        pokemon: {
          id: item.card.pokemon.id,
          name: item.card.pokemon.nameFr,
        },
      },
    }));

    return NextResponse.json({
      collections: formattedCollections,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}