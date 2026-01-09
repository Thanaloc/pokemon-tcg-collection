// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const pokemonNames = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public', 'pokemon-names.json'), 'utf-8')
);

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

function findPokemonMatch(card, pokemonNames) {
  // Strategy 1: Use dexId (most reliable)
  if (card.dexId && Array.isArray(card.dexId) && card.dexId.length > 0) {
    const dexId = card.dexId[0];
    const pokemon = pokemonNames.find(p => p.id === dexId);
    if (pokemon) return pokemon;
  }

  if (!card.name) return null;

  // Strategy 2: Exact name match
  const exactMatch = pokemonNames.find(p => p.name === card.name);
  if (exactMatch) return exactMatch;

  // Strategy 3: Normalized fuzzy matching
  const normalize = (str) => str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');

  // Remove common suffixes
  const cardBaseName = card.name
    .split(' ')[0]
    .split('-')[0]
    .replace(/ex$/i, '')
    .replace(/V$/i, '')
    .replace(/VMAX$/i, '')
    .replace(/VSTAR$/i, '')
    .replace(/GX$/i, '')
    .replace(/EX$/i, '')
    .trim();

  const normalizedCardName = normalize(cardBaseName);

  // Try exact normalized match
  const normalizedExact = pokemonNames.find(p =>
    normalize(p.name) === normalizedCardName
  );
  if (normalizedExact) return normalizedExact;

  // Try partial match
  const partialMatch = pokemonNames.find(p => {
    const normalizedPokeName = normalize(p.name);
    return normalizedCardName.includes(normalizedPokeName) ||
           normalizedPokeName.includes(normalizedCardName);
  });

  return partialMatch || null;
}

async function seedPokemon() {
  console.log('📄 Seeding Pokemon...');

  for (const pokemon of pokemonNames) {
    let nameEn = pokemon.name;

    try {
      const pokeData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`);
      if (pokeData) {
        const enName = pokeData.names.find(n => n.language.name === 'en');
        if (enName) nameEn = enName.name;
      }
    } catch (error) {
      // Keep French name as fallback
    }

    await prisma.pokemon.upsert({
      where: { id: pokemon.id },
      update: { nameEn: nameEn },
      create: {
        id: pokemon.id,
        nameFr: pokemon.name,
        nameEn: nameEn,
      },
    });

    if (pokemon.id % 100 === 0) {
      console.log(`   ... ${pokemon.id}/1025 done`);
    }
  }

  console.log(`✅ ${pokemonNames.length} Pokemon created`);
}

async function seedSetsAndCards() {
  console.log('📄 Fetching sets from TCGdex...');

  const setsData = await fetchWithRetry(`${TCGDEX_API}/sets`);

  if (!Array.isArray(setsData)) {
    throw new Error('Invalid sets data from TCGdex');
  }

  console.log(`Found ${setsData.length} sets`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalWithPrice = 0;
  const skipReasons = {
    tcgPocket: 0,
    notPokemon: 0,
    noPokemonFound: 0,
    error: 0
  };

  for (const set of setsData) {
    // Skip TCG Pocket sets
    if (/^[AB]\d/.test(set.id)) {
      console.log(`⏭️  Skipping TCG Pocket: ${set.name} (${set.id})`);
      skipReasons.tcgPocket++;
      continue;
    }

    await prisma.set.upsert({
      where: { id: set.id },
      update: { name: set.name },
      create: {
        id: set.id,
        name: set.name,
        series: set.serie?.name || 'Unknown',
        releaseDate: new Date(set.releaseDate || '2000-01-01'),
      },
    });

    console.log(`📦 Processing: ${set.name} (${set.id})`);

    const setDetails = await fetchWithRetry(`${TCGDEX_API}/sets/${set.id}`);
    const cards = setDetails?.cards || [];

    let processedCount = 0;
    let skippedCount = 0;
    let withPriceCount = 0;

    const BATCH_SIZE = 20;
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (cardSummary) => {
        try {
          const card = await fetchWithRetry(`${TCGDEX_API}/cards/${cardSummary.id}`);

          if (!card) {
            skippedCount++;
            skipReasons.error++;
            return;
          }

          // Only Pokemon cards
          if (card.category !== 'Pokémon') {
            skippedCount++;
            skipReasons.notPokemon++;
            return;
          }

          const pokemon = findPokemonMatch(card, pokemonNames);

          if (!pokemon) {
            console.log(`   ⚠️  No match: ${card.name} (${card.id})`);
            skippedCount++;
            skipReasons.noPokemonFound++;
            return;
          }

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

          // Create/update card
          await prisma.card.upsert({
            where: { id: card.id },
            update: {
              name: card.name,
              rarity: card.rarity || 'Common',
              imageFr: imageFr,
              imageSmallFr: imageSmallFr,
            },
            create: {
              id: card.id,
              number: card.localId || '',
              name: card.name,
              rarity: card.rarity || 'Common',
              imageFr: imageFr,
              imageEn: null,
              imageSmallFr: imageSmallFr,
              imageSmallEn: null,
              pokemon: { connect: { id: pokemon.id } },
              set: { connect: { id: set.id } },
            },
          });

          processedCount++;

          // Add CardMarket price if available (correct TCGdex structure)
          let cardmarketPrice = null;
          
          if (card.pricing?.cardmarket) {
            const pricing = card.pricing.cardmarket;
            cardmarketPrice = pricing.avg ||
                             pricing.avg7 ||
                             pricing.avg30 ||
                             pricing.trendPrice ||
                             pricing.averageSellPrice ||
                             null;
          }

          if (cardmarketPrice && cardmarketPrice > 0) {
            await prisma.price.upsert({
              where: { cardId: card.id },
              update: { cardmarketPrice: cardmarketPrice },
              create: {
                cardId: card.id,
                cardmarketPrice: cardmarketPrice,
              },
            });
            withPriceCount++;
          }

        } catch (error) {
          console.error(`   ❌ Error: ${cardSummary.id} - ${error.message}`);
          skippedCount++;
          skipReasons.error++;
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    totalProcessed += processedCount;
    totalSkipped += skippedCount;
    totalWithPrice += withPriceCount;

    console.log(`   ✔ ${processedCount} cards (${withPriceCount} with price), ${skippedCount} skipped`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Cards processed: ${totalProcessed}`);
  console.log(`   💰 Cards with price: ${totalWithPrice}`);
  console.log(`   ⏭️  Cards skipped: ${totalSkipped}`);
  console.log(`      └─ TCG Pocket: ${skipReasons.tcgPocket}`);
  console.log(`      └─ Not Pokemon: ${skipReasons.notPokemon}`);
  console.log(`      └─ No match: ${skipReasons.noPokemonFound}`);
  console.log(`      └─ Errors: ${skipReasons.error}`);
}

async function main() {
  try {
    console.log('🚀 Starting database seed...\n');

    await seedPokemon();
    await seedSetsAndCards();

    // Final stats
    const pokemonCount = await prisma.pokemon.count();
    const setCount = await prisma.set.count();
    const cardCount = await prisma.card.count();
    const priceCount = await prisma.price.count();
    const cardsWithImages = await prisma.card.count({
      where: { imageFr: { not: null } }
    });

    console.log('\n🎉 Seeding complete!\n');
    console.log('📊 Final Database State:');
    console.log(`   🐾 Pokemon: ${pokemonCount}`);
    console.log(`   📦 Sets: ${setCount}`);
    console.log(`   🃏 Cards: ${cardCount}`);
    console.log(`   🖼️  With images: ${cardsWithImages}`);
    console.log(`   💰 With prices: ${priceCount}`);

    const imagePercent = ((cardsWithImages / cardCount) * 100).toFixed(1);
    const pricePercent = ((priceCount / cardCount) * 100).toFixed(1);
    console.log(`\n   📈 Image coverage: ${imagePercent}%`);
    console.log(`   📈 Price coverage: ${pricePercent}%`);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();