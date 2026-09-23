import React from 'react';
import type { Pokemon } from '@/types';

interface Props {
  pokemon: Pokemon;
  onSelect: (p: Pokemon) => void;
}

export default React.memo(function PokemonItem({ pokemon, onSelect }: Props) {
  const count = pokemon.cardCount;

  return (
    <button
      type="button"
      onClick={() => onSelect(pokemon)}
      aria-label={`Voir les cartes de ${pokemon.name}`}
      className="group text-left rounded-lg border border-slate-800 bg-slate-900 p-3
                 hover:border-slate-600 hover:bg-slate-800/60 transition-colors
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- PokeAPI artwork */}
      <img
        src={pokemon.imageUrl}
        alt=""
        className="w-full h-24 object-contain mb-2"
        loading="lazy"
        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
      />
      <p className="text-xs text-slate-500 tabular-nums">#{pokemon.number}</p>
      <p className="font-medium text-white truncate">{pokemon.name}</p>
      {count !== undefined && (
        <p className={`text-xs mt-0.5 ${count > 0 ? 'text-slate-400' : 'text-slate-600'}`}>
          {count > 0 ? `${count} carte${count > 1 ? 's' : ''}` : 'Aucune carte'}
        </p>
      )}
    </button>
  );
});
