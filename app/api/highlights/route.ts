import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rarityRank } from '@/constants/rarities';
import pokemonNames from '@/public/pokemon-names.json';

const MIN_CARDS = 5;
const SHOWN_CARDS = 14;

/** Days since epoch in Paris time, so the pick changes at French midnight. */
function parisDayNumber(date = new Date()): number {
  const [y, m, d] = date.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }).split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

// "Pokémon du jour": a different Pokémon (with enough cards) every day,
// with its rarest cards. Same pick for every visitor on a given day.
export async function GET() {
  try {
    const groups = await prisma.card.groupBy({ by: ['pokemonId'], _count: { _all: true } });
    const eligible = groups
      .filter(g => g._count._all >= MIN_CARDS)
      .map(g => ({ id: g.pokemonId, total: g._count._all }))
      .sort((a, b) => a.id - b.id);

    if (eligible.length === 0) return NextResponse.json({ pokemonOfTheDay: null });

    // Multiplying by a prime spreads consecutive days across the Pokédex.
    const pick = eligible[(parisDayNumber() * 7919) % eligible.length];

    const cards = await prisma.card.findMany({
      where: { pokemonId: pick.id },
      include: { set: true, price: true },
    });
    cards.sort((a, b) =>
      rarityRank(b.rarity) - rarityRank(a.rarity) ||
      b.set.releaseDate.getTime() - a.set.releaseDate.getTime()
    );

    return NextResponse.json(
      {
        pokemonOfTheDay: {
          id: pick.id,
          name: pokemonNames.find(p => p.id === pick.id)?.name ?? '',
          totalCards: pick.total,
          cards: cards.slice(0, SHOWN_CARDS).map(card => ({
            id: card.id,
            name: card.name,
            number: card.number,
            rarity: card.rarity,
            set: card.set.name,
            smallImage: card.imageSmallFr || card.imageSmallEn,
            price: card.price?.cardmarketPrice ?? null,
            pokemonId: card.pokemonId,
          })),
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' } },
    );
  } catch (error) {
    console.error('Highlights error:', error);
    return NextResponse.json({ error: 'Unavailable' }, { status: 500 });
  }
}
