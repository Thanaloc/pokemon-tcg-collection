import { NextResponse } from 'next/server';
import TCGdex from '@tcgdex/sdk';

const tcgdex = new TCGdex('fr');
const cardsCache = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonName = searchParams.get('pokemon');
  
  if (!pokemonName) {
    return NextResponse.json({ error: 'Pokemon name required' }, { status: 400 });
  }
  
  if (cardsCache.has(pokemonName)) {
    console.log('Cache hit for', pokemonName);
    return NextResponse.json(cardsCache.get(pokemonName));
  }
  
  try {
    console.log('Fetching cards for', pokemonName, 'from TCGdex...');
    
    const cards = await tcgdex.fetch('cards');
    
    if (!cards || !Array.isArray(cards)) {
      console.log('No cards data received');
      return NextResponse.json([]);
    }
    
    const matchingCards = cards.filter((card: any) => 
      card.name && card.name.toLowerCase().includes(pokemonName.toLowerCase())
    );
    
    console.log('Found', matchingCards.length, 'matching cards for', pokemonName);
    
    const detailedCardsPromises = matchingCards.map(async (card: any) => {
      try {
        const fullCard = await tcgdex.fetch('cards', card.id);
        return fullCard;
      } catch (error) {
        console.error('Error fetching card details:', card.id, error);
        return null;
      }
    });
    
    const detailedCards = await Promise.all(detailedCardsPromises);
    
    const formattedCards = detailedCards
      .filter((card: any) => card !== null && card.image)
      .filter((card: any) => {
        const setId = card.set?.id || '';
        return !/^(A\d|P-A)/.test(setId);
      })
      .map((card: any) => {
        const imageBase = card.image.startsWith('http') 
          ? card.image 
          : `https://assets.tcgdex.net${card.image}`;
        
        // Extraire les infos Cardmarket
        const cardmarketPrice = card.pricing?.cardmarket?.avg30 || null;
        const query = `${card.name} ${card.localId || card.cardmarket?.number || ''} ${card.set?.name} cardmarket`;
        const encodedQuery = encodeURIComponent(query);
        const cardmarketUrl = `https://www.google.com/search?q=${encodedQuery}`;
        
        console.log(card.set.name);

        return {
          id: card.id,
          name: card.name,
          set: card.set?.name || 'Unknown',
          rarity: card.rarity || 'Common',
          image: `${imageBase}/high.webp`,
          smallImage: `${imageBase}/low.jpg`,
          number: card.localId || card.cardmarket?.number || '',
          series: card.set?.series || '',
          price: cardmarketPrice,
          cardmarketUrl: cardmarketUrl,
        };
      });
    
    console.log('Formatted', formattedCards.length, 'cards after filtering');
    
    cardsCache.set(pokemonName, formattedCards);
    return NextResponse.json(formattedCards);
    
  } catch (error: any) {
    console.error('TCGdex error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}