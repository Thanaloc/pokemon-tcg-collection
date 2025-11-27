import { NextResponse } from 'next/server';
import TCGdex from '@tcgdex/sdk';

// Initialise le SDK en français
const tcgdex = new TCGdex('fr');

// Cache
const cardsCache = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonName = searchParams.get('pokemon');
  
  if (!pokemonName) {
    return NextResponse.json({ error: 'Pokemon name required' }, { status: 400 });
  }
  
  // Check cache
  if (cardsCache.has(pokemonName)) {
    console.log('Cache hit for', pokemonName);
    return NextResponse.json(cardsCache.get(pokemonName));
  }
  
  try {
    console.log('Fetching cards for', pokemonName, 'from TCGdex...');
    
    // Recherche toutes les cartes du Pokémon
    const cards = await tcgdex.fetch('cards');
    
    // Vérifie que cards existe et est un tableau
    if (!cards || !Array.isArray(cards)) {
      console.log('No cards data received');
      return NextResponse.json([]);
    }
    
    // Filtre par nom de Pokémon (insensible à la casse)
    const matchingCards = cards.filter((card: any) => 
      card.name && card.name.toLowerCase().includes(pokemonName.toLowerCase())
    );
    
    console.log('Found', matchingCards.length, 'matching cards for', pokemonName);
    
    // Récupère les détails complets de chaque carte
    const detailedCardsPromises = matchingCards.map(async (card: any) => {
      try {
        // Fetch les détails complets de la carte
        const fullCard = await tcgdex.fetch('cards', card.id);
        return fullCard;
      } catch (error) {
        console.error('Error fetching card details:', card.id, error);
        return null;
      }
    });
    
    const detailedCards = await Promise.all(detailedCardsPromises);
    
    const formattedCards = detailedCards
      .filter((card: any) => card !== null && card.image) // Ne garde que les cartes valides avec image
      .filter((card: any) => {
        // Exclut les cartes Pokémon TCG Pocket
        const setId = card.set?.id || '';
        // TCG Pocket a des setId qui commencent par "A" + chiffre (A1, A2, A3...) ou "P-A"
        return !/^(A\d|P-A)/.test(setId);
      })
      .map((card: any) => {
        // Vérifie si l'URL d'image est complète ou partielle
        const imageBase = card.image.startsWith('http') 
          ? card.image 
          : `https://assets.tcgdex.net${card.image}`;
        
        return {
          id: card.id,
          name: card.name,
          set: card.set?.name || 'Unknown',
          rarity: card.rarity || 'Common',
          // Ajoute l'extension pour les images
          image: `${imageBase}/high.webp`,
          smallImage: `${imageBase}/low.jpg`,
          number: card.localId || card.cardmarket?.number || '',
          series: card.set?.series || '',
        };
      });
    
    console.log('Formatted', formattedCards.length, 'cards after filtering');
    
    // Cache le résultat
    cardsCache.set(pokemonName, formattedCards);
    
    return NextResponse.json(formattedCards);
    
  } catch (error: any) {
    console.error('TCGdex error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}