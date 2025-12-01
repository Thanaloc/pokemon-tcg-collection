import React from 'react';

interface Props {
  pokemonCount: number;
  cardCountLabel?: string;
}

export default function Stats({ pokemonCount, cardCountLabel = '25K+' }: Props) {
  return (
    <div className="flex gap-4 items-center">
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 px-6 py-3 rounded-2xl border border-red-400/20">
        <p className="text-xs text-red-300 font-medium uppercase tracking-wide">Pokémon</p>
        <p className="text-2xl font-extrabold text-white">{pokemonCount}</p>
      </div>
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 px-6 py-3 rounded-2xl border border-orange-400/20">
        <p className="text-xs text-orange-300 font-medium uppercase tracking-wide">Cartes</p>
        <p className="text-2xl font-extrabold text-white">{cardCountLabel}</p>
      </div>
    </div>
  );
}
