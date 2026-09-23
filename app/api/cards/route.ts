import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildCardmarketUrl } from '@/lib/cardmarket';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonId = Number.parseInt(searchParams.get('pokemonId') ?? '', 10);

  if (!Number.isInteger(pokemonId) || pokemonId < 1) {
    return NextResponse.json({ error: 'pokemonId required' }, { status: 400 });
  }

  try {
    const cards = await prisma.card.findMany({
      where: { pokemonId },
      include: {
        set: true,
        price: true,
      },
      orderBy: [
        { set: { releaseDate: 'desc' } },
        { number: 'asc' },
      ],
    });

    const formattedCards = cards.map(card => ({
      id: card.id,
      name: card.name,
      set: card.set.name,
      rarity: card.rarity,
      image: card.imageFr || card.imageEn || '/placeholder-card.png',
      smallImage: card.imageSmallFr || card.imageSmallEn || '/placeholder-card.png',
      number: card.number,
      series: card.set.series,
      releaseDate: card.set.releaseDate.toISOString(),
      price: card.price?.cardmarketPrice ?? null,
      cardmarketUrl: buildCardmarketUrl({ name: card.name, number: card.number }),
    }));

    // Public data refreshed once a day: let the CDN serve it.
    return NextResponse.json(formattedCards, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Impossible de charger les cartes' }, { status: 500 });
  }
}
