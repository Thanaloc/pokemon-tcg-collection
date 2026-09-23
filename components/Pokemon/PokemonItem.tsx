import React from 'react';
import type { Pokemon } from '@/types';
import { typeColor } from '@/constants/types';
import TypeBadge from '@/components/ui/TypeBadge';

interface Props {
  pokemon: Pokemon;
  onSelect: (p: Pokemon) => void;
}

export default React.memo(function PokemonItem({ pokemon, onSelect }: Props) {
  const count = pokemon.cardCount;
  const color = typeColor(pokemon.types[0]);

  return (
    <button
      type="button"
      onClick={() => onSelect(pokemon)}
      aria-label={`Voir les cartes de ${pokemon.name}`}
      className="group relative text-left rounded-xl border border-slate-800 bg-slate-900 p-3 overflow-hidden
                 hover:border-slate-600 transition active:scale-[0.98]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      style={{ backgroundImage: `radial-gradient(120% 70% at 50% 0%, ${color}38, transparent 70%)` }}
    >
      <span className="absolute right-3 top-2 font-display text-2xl font-bold text-white/10 tabular-nums select-none">
        {pokemon.number}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- PokeAPI artwork */}
      <img
        src={pokemon.imageUrl}
        alt=""
        className="relative w-full h-24 object-contain mb-2 drop-shadow-md transition-transform duration-300 group-hover:-translate-y-1"
        loading="lazy"
        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
      />
      <p className="font-display font-semibold text-white truncate">{pokemon.name}</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {pokemon.types.map(type => <TypeBadge key={type} type={type} />)}
      </div>
      {count !== undefined && (
        <p className={`text-xs mt-2 ${count > 0 ? 'text-slate-400' : 'text-slate-600'}`}>
          {count > 0 ? `${count} carte${count > 1 ? 's' : ''}` : 'Aucune carte'}
        </p>
      )}
    </button>
  );
});
