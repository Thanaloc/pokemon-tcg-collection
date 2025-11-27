import { NextResponse } from 'next/server';

// Cache
let cachedPokemon: any[] | null = null;

export async function GET() {
  if (cachedPokemon) {
    return NextResponse.json(cachedPokemon);
  }

  try {
    console.log('Fetching Pokemon with French names...');
    
    // Récupère tous les Pokémon
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
    const data = await response.json();
    
    // Pour chaque Pokémon, on récupère son nom français
    const pokemonPromises = data.results.map(async (poke: any, index: number) => {
      const pokedexNum = index + 1;
      
      try {
        // Récupère les détails du Pokémon pour avoir le nom français
        const detailsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokedexNum}`);
        const details = await detailsResponse.json();
        
        // Trouve le nom français
        const frenchName = details.names.find((n: any) => n.language.name === 'fr')?.name || poke.name;
        
        return {
          id: pokedexNum,
          name: frenchName,
          number: String(pokedexNum).padStart(3, '0'),
          types: [],
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNum}.png`
        };
      } catch (error) {
        // Fallback sur le nom anglais si erreur
        return {
          id: pokedexNum,
          name: poke.name.charAt(0).toUpperCase() + poke.name.slice(1),
          number: String(pokedexNum).padStart(3, '0'),
          types: [],
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNum}.png`
        };
      }
    });
    
    // Attendre tous les appels (avec limite de 50 à la fois pour pas surcharger)
    const batchSize = 50;
    const pokemonList = [];
    
    for (let i = 0; i < pokemonPromises.length; i += batchSize) {
      const batch = await Promise.all(pokemonPromises.slice(i, i + batchSize));
      pokemonList.push(...batch);
      console.log(`Loaded ${pokemonList.length}/${pokemonPromises.length} Pokemon`);
    }
    
    cachedPokemon = pokemonList;
    console.log('All Pokemon loaded with French names!');
    
    return NextResponse.json(pokemonList);
    
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}