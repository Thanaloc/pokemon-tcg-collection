import { NextResponse } from 'next/server';
import pokemonNames from '@/public/pokemon-names.json';
import { prisma } from '@/lib/prisma';

// Same for every visitor and only changes with the daily sync: cache it on the CDN.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' };

export async function GET() {
  const namesEn = new Map<number, string>();
  const cardCounts = new Map<number, number>();
  try {
    const [pokemon, counts] = await Promise.all([
      prisma.pokemon.findMany({ select: { id: true, nameEn: true } }),
      prisma.card.groupBy({ by: ['pokemonId'], _count: { _all: true } }),
    ]);
    pokemon.forEach(p => namesEn.set(p.id, p.nameEn));
    counts.forEach(c => cardCounts.set(c.pokemonId, c._count._all));
  } catch (error) {
    // The Pokédex still works from the static list without the database.
    console.error('Pokémon enrichment failed:', error);
  }

  const pokemonList = pokemonNames.map(p => ({
    ...p,
    nameEn: namesEn.get(p.id),
    cardCount: cardCounts.get(p.id) ?? 0,
    number: String(p.id).padStart(3, '0'),
    types: [],
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
  }));

  return NextResponse.json(pokemonList, { headers: cardCounts.size > 0 ? CACHE_HEADERS : undefined });
}
