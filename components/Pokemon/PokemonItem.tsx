import React from 'react';
import type { Pokemon } from '@/types';
import { TYPE_COLORS } from '@/constants/colors';

interface Props {
  pokemon: Pokemon;
  onSelect: (p: Pokemon) => void;
}

export default React.memo(function PokemonItem({ pokemon, onSelect }: Props) {
    
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(pokemon);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(pokemon)}
      onKeyDown={handleKeyDown}
      aria-label={`Voir les cartes de ${pokemon.name}`}
      className="relative rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:rotate-2 p-4 border border-red-500/20 hover:border-red-400/60 group overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      {/* Effets visuels */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

      <img 
        src={pokemon.imageUrl} 
        alt={pokemon.name} 
        className="w-full h-28 object-contain mb-3" 
        loading="lazy" 
      />
      
      <div className="text-center relative z-10">
        <p className="text-xs text-red-300 font-mono inline-block px-3 py-1 rounded-full mb-2 border border-red-500/10">
          #{pokemon.number}
        </p>
        <h3 className="font-semibold text-white text-base mb-2">
          {pokemon.name}
        </h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {pokemon.types.slice(0, 2).map((t, i) => (
            <span 
              key={i} 
              className={`text-xs px-2 py-1 rounded-lg font-semibold ${TYPE_COLORS[t] || 'bg-gray-100'}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});