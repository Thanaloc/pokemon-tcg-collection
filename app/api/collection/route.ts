import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const SORTS = {
  set: [
    { card: { set: { releaseDate: 'desc' } } },
    { card: { setId: 'asc' } },
    { card: { number: 'asc' } },
  ],
  pokemon: [{ card: { pokemonId: 'asc' } }, { addedAt: 'desc' }],
  price: [{ card: { price: { cardmarketPrice: { sort: 'desc', nulls: 'last' } } } }, { addedAt: 'desc' }],
  quantity: [{ quantity: 'desc' }, { addedAt: 'desc' }],
  recent: [{ addedAt: 'desc' }],
} satisfies Record<string, Prisma.UserCollectionOrderByWithRelationInput[]>;

type SortKey = keyof typeof SORTS;

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : Math.min(max, Math.max(min, parsed));
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const page = clampInt(searchParams.get('page'), 1, 1, 10_000);
    const limit = clampInt(searchParams.get('limit'), 50, 1, 200);
    const sortParam = searchParams.get('sort') ?? 'set';
    const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : 'set';
    const q = (searchParams.get('q') ?? '').trim().slice(0, 100);

    // Search and sort run on the whole collection, not just the current page.
    const where: Prisma.UserCollectionWhereInput = { userId };
    if (q) {
      const contains = { contains: q, mode: 'insensitive' as const };
      where.card = {
        OR: [
          { name: contains },
          { set: { name: contains } },
          { set: { series: contains } },
          { pokemon: { nameFr: contains } },
          { pokemon: { nameEn: contains } },
        ],
      };
    }

    const [collections, total, [stats]] = await Promise.all([
      prisma.userCollection.findMany({
        where,
        include: {
          card: {
            include: {
              set: true,
              price: true,
              pokemon: true,
            },
          },
        },
        orderBy: SORTS[sort],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.userCollection.count({ where }),
      prisma.$queryRaw<{ distinct_cards: bigint; copies: bigint; value: number }[]>`
        SELECT COUNT(*) AS distinct_cards,
               COALESCE(SUM(uc.quantity), 0) AS copies,
               COALESCE(SUM(uc.quantity * p.cardmarket_price), 0)::float8 AS value
        FROM user_collections uc
        LEFT JOIN prices p ON p.card_id = uc.card_id
        WHERE uc.user_id = ${userId}`,
    ]);

    const formattedCollections = collections.map(item => ({
      id: item.id,
      quantity: item.quantity,
      addedAt: item.addedAt,
      card: {
        id: item.card.id,
        name: item.card.name,
        number: item.card.number,
        rarity: item.card.rarity,
        image: item.card.imageFr || item.card.imageEn || '/placeholder-card.svg',
        smallImage: item.card.imageSmallFr || item.card.imageSmallEn || '/placeholder-card.svg',
        set: item.card.set.name,
        series: item.card.set.series,
        price: item.card.price?.cardmarketPrice ?? null,
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
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: {
        distinctCards: Number(stats.distinct_cards),
        totalCopies: Number(stats.copies),
        totalValue: Number(stats.value),
      },
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ error: 'Impossible de charger la collection' }, { status: 500 });
  }
}
