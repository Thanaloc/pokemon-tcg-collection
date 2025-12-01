'use client';

import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import PokemonGrid from '@/components/Pokemon/PokemonGrid';
import PokemonModal from '@/components/Modal/PokemonModal';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Pokemon } from '@/types';

export default function Page() {
  const { allPokemon, filteredPokemon, searchTerm, setSearchTerm, isLoading, error, reload } = usePokemonData();
  const [selected, setSelected] = useState<Pokemon | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      <Header 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        pokemonCount={allPokemon.length} 
        isLoading={isLoading} 
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-900/30 border-2 border-red-500/40 rounded-2xl p-8 text-center">
            <p className="text-red-200 font-semibold text-lg">{error}</p>
            <button 
              onClick={reload} 
              className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition"
            >
              Réessayer
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin w-14 h-14 border-4 border-red-500/40 border-t-transparent rounded-full"></div>
            <p className="text-white font-bold text-xl mt-6">Chargement du Pokédex...</p>
            <p className="text-sm text-red-300 mt-3">(~2 minutes la première fois)</p>
          </div>
        ) : filteredPokemon.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-red-500/10">
            <p className="text-red-200 text-lg font-medium">Aucun Pokémon trouvé</p>
          </div>
        ) : (
          <PokemonGrid items={filteredPokemon} onSelect={setSelected} />
        )}
      </main>

      <PokemonModal pokemon={selected} onClose={() => setSelected(null)} />
    </div>
  );
}