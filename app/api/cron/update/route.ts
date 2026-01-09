import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TCGDEX_API = 'https://api.tcgdex.net/v2/fr';

async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting database update via cron...');

    let setsUpdated = 0;
    let cardsAdded = 0;
    let cardsUpdated = 0;
    let pricesUpdated = 0;

    const setsData = await fetchWithRetry(`${TCGDEX_API}/sets`);
    
    if (!Array.isArray(setsData)) {
      throw new Error('Invalid sets data');
    }

    const existingSets = await prisma.set.findMany({
      select: { id: true }
    });
    const existingSetIds = new Set(existingSets.map(s => s.id));

    const existingCards = await prisma.card.findMany({
      select: { id: true }
    });
    const existingCardIds = new Set(existingCards.map(c => c.id));

    // Process only first 5 sets for testing (remove this limit in production)
    const setsToProcess = setsData.slice(0, 5);

    for (const set of setsToProcess) {
      if (/^[AB]\d/.test(set.id)) continue;

      if (!existingSetIds.has(set.id)) {
        await prisma.set.create({
          data: {
            id: set.id,
            name: set.name,
            series: set.serie?.name || 'Unknown',
            releaseDate: new Date(set.releaseDate || '2000-01-01'),
          },
        });
        setsUpdated++;
        console.log(`➕ New set: ${set.name}`);
      }

      const setDetails = await fetchWithRetry(`${TCGDEX_API}/sets/${set.id}`);
      const cards = setDetails?.cards || [];

      for (const cardSummary of cards) {
        try {
          const card = await fetchWithRetry(`${TCGDEX_API}/cards/${cardSummary.id}`);
          if (!card || card.category !== 'Pokémon') continue;

          let pokemon = null;

          if (card.dexId && Array.isArray(card.dexId) && card.dexId.length > 0) {
            pokemon = await prisma.pokemon.findUnique({
              where: { id: card.dexId[0] }
            });
          }

          if (!pokemon) continue;

          let imageFr = null;
          let imageSmallFr = null;

          if (card.image) {
            const baseUrl = card.image.startsWith('http')
              ? card.image
              : `https://assets.tcgdex.net${card.image}`;
            imageFr = `${baseUrl}/high.webp`;
            imageSmallFr = `${baseUrl}/low.jpg`;
          }

          if (!existingCardIds.has(card.id)) {
            await prisma.card.create({
              data: {
                id: card.id,
                number: card.localId || '',
                name: card.name,
                rarity: card.rarity || 'Common',
                imageFr,
                imageEn: null,
                imageSmallFr,
                imageSmallEn: null,
                pokemonId: pokemon.id,
                setId: set.id,
              },
            });
            cardsAdded++;
          } else {
            await prisma.card.update({
              where: { id: card.id },
              data: {
                name: card.name,
                rarity: card.rarity || 'Common',
                imageFr,
                imageSmallFr,
              },
            });
            cardsUpdated++;
          }

          const cardmarketPrice = card.pricing?.cardmarket?.avg ||
                                  card.pricing?.cardmarket?.avg7 ||
                                  card.pricing?.cardmarket?.avg30 ||
                                  null;

          if (cardmarketPrice && cardmarketPrice > 0) {
            await prisma.price.upsert({
              where: { cardId: card.id },
              update: { cardmarketPrice },
              create: {
                cardId: card.id,
                cardmarketPrice,
              },
            });
            pricesUpdated++;
          }

        } catch (error: any) {
          console.error(`Error processing card ${cardSummary.id}:`, error.message);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✅ Update complete');
    
    return NextResponse.json({
      success: true,
      stats: {
        setsUpdated,
        cardsAdded,
        cardsUpdated,
        pricesUpdated,
      },
      message: 'Database updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Update failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}