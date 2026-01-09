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
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';

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
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function seedPokemon() {
  console.log('🔄 Seeding Pokemon...');
  
  for (const pokemon of pokemonNames) {
    let nameEn = pokemon.name;
    
    try {
      const pokeData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`);
      const enName = pokeData.names.find(n => n.language.name === 'en');
      if (enName) nameEn = enName.name;
    } catch (error) {
      console.log(`⚠️  Could not fetch EN name for ${pokemon.name}`);
    }
    
    await prisma.pokemon.upsert({
      where: { id: pokemon.id },
      update: {},
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
  console.log('🔄 Fetching sets from TCGdex...');
  
  const setsData = await fetchWithRetry(`${TCGDEX_API}/sets`);
  
  if (!Array.isArray(setsData)) {
    throw new Error('Invalid sets data from TCGdex');
  }
  
  console.log(`Found ${setsData.length} sets`);
  
  for (const set of setsData) {
    // Skip TCG Pocket sets (format A1, A1a, A2, B1, B2 etc.)
    if (/^[AB]\d/.test(set.id)) {
      console.log(`⏭️  Skipping TCG Pocket set: ${set.name} (${set.id})`);
      continue;
    }
    
    await prisma.set.upsert({
      where: { id: set.id },
      update: {},
      create: {
        id: set.id,
        name: set.name,
        series: set.serie?.name || 'Unknown',
        releaseDate: new Date(set.releaseDate || '2000-01-01'),
      },
    });
    
    console.log(`📦 Processing set: ${set.name} (${set.id})`);
    
    // Fetch full set details with cards
    const setDetails = await fetchWithRetry(`${TCGDEX_API}/sets/${set.id}`);
    const cards = setDetails.cards || [];
    
    let processedCount = 0;
    let skippedCount = 0;
    let skipReasons = {
      notPokemon: 0,
      noPokemonFound: 0,
      error: 0
    };
    
    // Process cards in batches of 20 in parallel
    const BATCH_SIZE = 20;
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (cardSummary) => {
        try {
          const card = await fetchWithRetry(`${TCGDEX_API}/cards/${cardSummary.id}`);
          
          if (card.category !== 'Pokémon') {
            skippedCount++;
            skipReasons.notPokemon++;
            return;
          }
          
          let pokemon = null;
          
          if (card.dexId && Array.isArray(card.dexId) && card.dexId.length > 0) {
            const dexId = card.dexId[0];
            pokemon = pokemonNames.find(p => p.id === dexId);
          }
          
          if (!pokemon && card.name) {
            const normalize = (str) => str.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]/g, '');
            
            const cardBaseName = card.name.split(' ')[0].split('-')[0];
            const normalizedCardName = normalize(cardBaseName);
            
            pokemon = pokemonNames.find(p => normalize(p.name) === normalizedCardName);
          }
          
          if (!pokemon) {
            skippedCount++;
            skipReasons.noPokemonFound++;
            return;
          }
          
          let imageFr = null;
          let imageSmallFr = null;
          
          if (card.image) {
            const baseUrl = card.image.startsWith('http') 
              ? card.image 
              : `https://assets.tcgdex.net${card.image}`;
            imageFr = `${baseUrl}/high.webp`;
            imageSmallFr = `${baseUrl}/low.jpg`;
          }
          
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
              pokemon: {
                connect: { id: pokemon.id }
              },
              set: {
                connect: { id: set.id }
              },
            },
          });
          
          processedCount++;
          
        } catch (error) {
          skippedCount++;
          skipReasons.error++;
        }
      }));
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`   ✓ ${processedCount} Pokemon cards added, ${skippedCount} skipped`);
    console.log(`     └─ Not Pokemon: ${skipReasons.notPokemon}, No match: ${skipReasons.noPokemonFound}, Errors: ${skipReasons.error}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('✅ All sets and cards seeded!');
}

async function main() {
  try {
    await seedPokemon();
    await seedSetsAndCards();
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();