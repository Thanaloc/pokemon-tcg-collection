// Fills an empty database: the 1025 Pokémon, then the full TCGdex catalogue.
//   npm run seed
import './load-env';
import pokemonNames from '../public/pokemon-names.json';
import { prisma } from '@/lib/prisma';
import { mapWithConcurrency } from '@/lib/tcgdex/client';
import { refreshPrices, syncCatalog } from '@/lib/tcgdex/sync';

interface PokeApiSpecies {
  names: { name: string; language: { name: string } }[];
}

async function fetchEnglishName(id: number): Promise<string | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const species = (await response.json()) as PokeApiSpecies;
    return species.names.find(n => n.language.name === 'en')?.name ?? null;
  } catch {
    return null;
  }
}

async function seedPokemon() {
  console.log('📄 Seeding Pokémon...');
  const results = await mapWithConcurrency(pokemonNames, 10, async pokemon => {
    const nameEn = (await fetchEnglishName(pokemon.id)) ?? pokemon.name;
    await prisma.pokemon.upsert({
      where: { id: pokemon.id },
      update: { nameFr: pokemon.name, nameEn },
      create: { id: pokemon.id, nameFr: pokemon.name, nameEn },
    });
  });
  const failed = results.filter(r => r.status !== 'ok').length;
  console.log(`✅ ${pokemonNames.length - failed} Pokémon seeded (${failed} errors)`);
}

async function main() {
  await seedPokemon();

  console.log('📦 Syncing catalogue from TCGdex (this takes a while)...');
  console.table(await syncCatalog(prisma));

  console.log('💰 Fetching prices...');
  console.table(await refreshPrices(prisma));

  const [pokemon, sets, cards, prices] = await Promise.all([
    prisma.pokemon.count(),
    prisma.set.count(),
    prisma.card.count(),
    prisma.price.count(),
  ]);
  console.log('\n🎉 Seeding complete!');
  console.table({ pokemon, sets, cards, prices });
}

main()
  .catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
