'use client';

import React, { useCallback, useState } from 'react';
import SiteNav from '@/components/Header/SiteNav';
import SearchBar from '@/components/Header/SearchBar';
import PokemonGrid from '@/components/Pokemon/PokemonGrid';
import PokemonModal from '@/components/Modal/PokemonModal';
import { usePokemonData } from '@/hooks/usePokemonData';
import { Pokemon } from '@/types';

const format = new Intl.NumberFormat('fr-FR');

export default function Page() {
  const { allPokemon, filteredPokemon, cardCount, searchTerm, setSearchTerm, isLoading, error, reload } = usePokemonData();
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Pokédex des cartes</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isLoading
                ? 'Chargement…'
                : `${format.format(allPokemon.length)} Pokémon · ${format.format(cardCount)} cartes en français`}
            </p>
          </div>
          <div className="w-full sm:max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        {error ? (
          <div className="border border-red-900 bg-red-950/40 rounded-lg p-6 text-center">
            <p className="text-red-200">{error}</p>
            <button
              onClick={reload}
              className="mt-4 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin w-8 h-8 border-2 border-slate-700 border-t-red-500 rounded-full" aria-label="Chargement"></div>
          </div>
        ) : filteredPokemon.length === 0 ? (
          <p className="text-center text-slate-400 py-16">Aucun Pokémon ne correspond à « {searchTerm} ».</p>
        ) : (
          <PokemonGrid items={filteredPokemon} onSelect={setSelected} />
        )}
      </main>

      <PokemonModal pokemon={selected} onClose={closeModal} />
    </div>
  );
}
