/* eslint-disable @next/next/no-img-element -- PokeAPI artwork */

export function pokemonArtUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** Official artwork of a Pokémon, for empty states and headers. */
export default function PokemonArt({ id, className = '' }: { id: number; className?: string }) {
  return <img src={pokemonArtUrl(id)} alt="" aria-hidden="true" loading="lazy" className={`object-contain ${className}`} />;
}
