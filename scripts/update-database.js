// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TCGDEX_API = 'https://api.tcgdex.net/v2/fr';

async function fetchWithRetry(url, retries = 3) {
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

async function updateDatabase() {
  console.log('🔄 Starting database update...\n');

  let setsUpdated = 0;
  let cardsAdded = 0;
  let cardsUpdated = 0;
  let pricesUpdated = 0;

  try {
    // Get all sets from TCGdex
    const setsData = await fetchWithRetry(`${TCGDEX_API}/sets`);
    
    if (!Array.isArray(setsData)) {
      throw new Error('Invalid sets data');
    }

    // Get existing sets from DB
    const existingSets = await prisma.set.findMany({
      select: { id: true }
    });
    const existingSetIds = new Set(existingSets.map(s => s.id));

    // Get existing cards from DB
    const existingCards = await prisma.card.findMany({
      select: { id: true }
    });
    const existingCardIds = new Set(existingCards.map(c => c.id));

    for (const set of setsData) {
      // Skip TCG Pocket
      if (/^[AB]\d/.test(set.id)) {
        continue;
      }

      // Update or create set
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

      // Fetch set cards
      const setDetails = await fetchWithRetry(`${TCGDEX_API}/sets/${set.id}`);
      const cards = setDetails?.cards || [];

      for (const cardSummary of cards) {
        try {
          const card = await fetchWithRetry(`${TCGDEX_API}/cards/${cardSummary.id}`);

          if (!card || card.category !== 'Pokémon') continue;

          // Try to find matching Pokemon
          let pokemon = null;

          if (card.dexId && Array.isArray(card.dexId) && card.dexId.length > 0) {
            pokemon = await prisma.pokemon.findUnique({
              where: { id: card.dexId[0] }
            });
          }

          if (!pokemon && card.name) {
            const normalize = (str) => str.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]/g, '');

            const cardBaseName = card.name
              .split(' ')[0]
              .split('-')[0]
              .replace(/ex$/i, '')
              .replace(/V$/i, '')
              .trim();

            const normalizedCardName = normalize(cardBaseName);

            pokemon = await prisma.pokemon.findFirst({
              where: {
                OR: [
                  { nameFr: { contains: normalizedCardName, mode: 'insensitive' } },
                  { nameEn: { contains: normalizedCardName, mode: 'insensitive' } },
                ],
              },
            });
          }

          if (!pokemon) continue;

          // Prepare images
          let imageFr = null;
          let imageSmallFr = null;

          if (card.image) {
            const baseUrl = card.image.startsWith('http')
              ? card.image
              : `https://assets.tcgdex.net${card.image}`;
            imageFr = `${baseUrl}/high.webp`;
            imageSmallFr = `${baseUrl}/low.jpg`;
          }

          // Create or update card
          if (!existingCardIds.has(card.id)) {
            await prisma.card.create({
              data: {
                id: card.id,
                number: card.localId || '',
                name: card.name,
                rarity: card.rarity || 'Common',
                imageFr: imageFr,
                imageEn: null,
                imageSmallFr: imageSmallFr,
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
                imageFr: imageFr,
                imageSmallFr: imageSmallFr,
              },
            });
            cardsUpdated++;
          }

          // Update price
          const cardmarketPrice = card.pricing?.cardmarket?.avg ||
                                  card.pricing?.cardmarket?.avg7 ||
                                  card.pricing?.cardmarket?.avg30 ||
                                  card.pricing?.cardmarket?.trendPrice ||
                                  null;

          if (cardmarketPrice && cardmarketPrice > 0) {
            await prisma.price.upsert({
              where: { cardId: card.id },
              update: { cardmarketPrice: cardmarketPrice },
              create: {
                cardId: card.id,
                cardmarketPrice: cardmarketPrice,
              },
            });
            pricesUpdated++;
          }

        } catch (error) {
          console.error(`❌ Error processing card ${cardSummary.id}:`, error.message);
        }
      }

      // Small delay between sets
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ Update complete!');
    console.log(`   📦 Sets updated: ${setsUpdated}`);
    console.log(`   ➕ Cards added: ${cardsAdded}`);
    console.log(`   🔄 Cards updated: ${cardsUpdated}`);
    console.log(`   💰 Prices updated: ${pricesUpdated}`);

  } catch (error) {
    console.error('\n❌ Update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

updateDatabase();