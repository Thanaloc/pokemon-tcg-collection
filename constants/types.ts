import pokemonTypes from './pokemon-types.json';

// Pokémon types (video game ones, from PokeAPI data) with their usual colors.
export const TYPES: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '#A8A77A' },
  fire: { label: 'Feu', color: '#EE8130' },
  water: { label: 'Eau', color: '#6390F0' },
  electric: { label: 'Électrik', color: '#F7D02C' },
  grass: { label: 'Plante', color: '#7AC74C' },
  ice: { label: 'Glace', color: '#96D9D6' },
  fighting: { label: 'Combat', color: '#C22E28' },
  poison: { label: 'Poison', color: '#A33EA1' },
  ground: { label: 'Sol', color: '#E2BF65' },
  flying: { label: 'Vol', color: '#A98FF3' },
  psychic: { label: 'Psy', color: '#F95587' },
  bug: { label: 'Insecte', color: '#A6B91A' },
  rock: { label: 'Roche', color: '#B6A136' },
  ghost: { label: 'Spectre', color: '#735797' },
  dragon: { label: 'Dragon', color: '#6F35FC' },
  dark: { label: 'Ténèbres', color: '#705746' },
  steel: { label: 'Acier', color: '#B7B7CE' },
  fairy: { label: 'Fée', color: '#D685AD' },
};

export const TYPE_IDS = Object.keys(TYPES);

const byPokemon = pokemonTypes as Record<string, string[]>;

export function typesOf(pokemonId: number): string[] {
  return byPokemon[String(pokemonId)] ?? [];
}

export function typeColor(type: string | undefined): string {
  return (type && TYPES[type]?.color) || '#64748b';
}
