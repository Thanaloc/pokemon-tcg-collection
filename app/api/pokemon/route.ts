import { NextResponse } from 'next/server';
import pokemonNames from '@/public/pokemon-names.json';

export async function GET() {
  const pokemonList = pokemonNames.map(p => ({
    ...p,
    number: String(p.id).padStart(3, '0'),
    types: [],
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
  }));
  
  return NextResponse.json(pokemonList);
}