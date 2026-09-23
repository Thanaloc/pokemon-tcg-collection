import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { rarityRank } from '@/constants/rarities';

const include = { set: true, price: true } satisfies Prisma.CardInclude;
type CardWithSet = Prisma.CardGetPayload<{ include: typeof include }>;

function format(card: CardWithSet) {
  return {
    id: card.id,
    name: card.name,
    number: card.number,
    rarity: card.rarity,
    set: card.set.name,
    smallImage: card.imageSmallFr || card.imageSmallEn,
    price: card.price?.cardmarketPrice ?? null,
    pokemonId: card.pokemonId,
  };
}

// Home page showcase: the newest set's rarest cards and the priciest cards.
export async function GET() {
  try {
    const latestSet = await prisma.set.findFirst({
      where: { cards: { some: {} } },
      orderBy: { releaseDate: 'desc' },
    });

    const [latestCards, priciest] = await Promise.all([
      latestSet
        ? prisma.card.findMany({ where: { setId: latestSet.id }, include })
        : Promise.resolve([]),
      prisma.card.findMany({
        where: { price: { cardmarketPrice: { not: null } } },
        orderBy: { price: { cardmarketPrice: 'desc' } },
        take: 12,
        include,
      }),
    ]);

    const newest = latestCards
      .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity))
      .slice(0, 12);

    return NextResponse.json(
      {
        latestSet: latestSet ? { name: latestSet.name, releaseDate: latestSet.releaseDate } : null,
        newest: newest.map(format),
        priciest: priciest.map(format),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    console.error('Highlights error:', error);
    return NextResponse.json({ error: 'Unavailable' }, { status: 500 });
  }
}
