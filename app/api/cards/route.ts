import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonName = searchParams.get('pokemon');
  
  if (!pokemonName) {
    return NextResponse.json({ error: 'Pokemon name required' }, { status: 400 });
  }

  try {
    console.log('Fetching cards for', pokemonName, 'from database...');

    const normalize = (str: string) => str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    const searchNameNormalized = normalize(pokemonName);

    // Find matching Pokemon
    const pokemon = await prisma.pokemon.findFirst({
      where: {
        OR: [
          { nameFr: { equals: pokemonName, mode: 'insensitive' } },
          { nameEn: { equals: pokemonName, mode: 'insensitive' } },
        ],
      },
    });

    if (!pokemon) {
      console.log('Pokemon not found:', pokemonName);
      return NextResponse.json([]);
    }

    // Fetch all cards for this Pokemon
    const cards = await prisma.card.findMany({
      where: {
        pokemonId: pokemon.id,
      },
      include: {
        set: true,
        price: true,
      },
      orderBy: [
        { set: { releaseDate: 'desc' } },
        { number: 'asc' },
      ],
    });

    // Format cards for frontend
    const formattedCards = cards.map((card) => {
      const cardmarketUrl = `https://www.google.com/search?q=${encodeURIComponent(
        `${card.name} ${card.number} ${card.set.name} cardmarket`
      )}`;

      return {
        id: card.id,
        name: card.name,
        set: card.set.name,
        rarity: card.rarity,
        image: card.imageFr || '/placeholder.png',
        smallImage: card.imageSmallFr || '/placeholder.png',
        number: card.number,
        series: card.set.series,
        price: card.price?.cardmarketPrice || null,
        cardmarketUrl: cardmarketUrl,
      };
    });

    console.log('Found', formattedCards.length, 'cards for', pokemonName);
    return NextResponse.json(formattedCards);

  } catch (error: any) {
    console.error('Database error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}