'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SiteNav from '@/components/Header/SiteNav';
import SearchBar from '@/components/Header/SearchBar';
import PokemonGrid from '@/components/Pokemon/PokemonGrid';
import PokemonModal from '@/components/Modal/PokemonModal';
import CardRail, { type RailCard } from '@/components/Home/CardRail';
import PokemonArt from '@/components/ui/PokemonArt';
import { usePokemonData } from '@/hooks/usePokemonData';
import { TYPES, TYPE_IDS } from '@/constants/types';
import { Pokemon } from '@/types';

const format = new Intl.NumberFormat('fr-FR');

interface Highlights {
  latestSet: { name: string; releaseDate: string } | null;
  newest: RailCard[];
  priciest: RailCard[];
}

export default function Page() {
  const { allPokemon, filteredPokemon, cardCount, searchTerm, setSearchTerm, isLoading, error, reload } = usePokemonData();
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    fetch('/api/highlights')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setHighlights(data); })
      .catch(() => {});
  }, []);

  const visiblePokemon = useMemo(
    () => (typeFilter ? filteredPokemon.filter(p => p.types.includes(typeFilter)) : filteredPokemon),
    [filteredPokemon, typeFilter],
  );

  const openPokemon = (pokemonId: number) => {
    const pokemon = allPokemon.find(p => p.id === pokemonId);
    if (pokemon) setSelected(pokemon);
  };

  const browsing = !searchTerm.trim() && !typeFilter;

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        <section className="relative mb-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Toutes les cartes,<br />
              <span className="text-red-500">Pokémon par Pokémon.</span>
            </h1>
            <p className="text-slate-400 mt-3 max-w-xl">
              {isLoading
                ? 'Chargement du Pokédex…'
                : `${format.format(cardCount)} cartes françaises réparties sur ${format.format(allPokemon.length)} Pokémon, avec leur prix Cardmarket. Construisez votre collection et suivez la cote de vos cartes.`}
            </p>
            <div className="mt-5 max-w-xl">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>
          <div className="hidden md:flex items-end -space-x-10 pr-4" aria-hidden="true">
            <PokemonArt id={25} className="w-36 h-36 drop-shadow-xl -rotate-6" />
            <PokemonArt id={6} className="w-48 h-48 drop-shadow-xl" />
            <PokemonArt id={249} className="w-36 h-36 drop-shadow-xl rotate-6" />
          </div>
        </section>

        {browsing && highlights && (
          <div className="mb-10 space-y-8">
            <CardRail
              title="Nouveautés"
              subtitle={highlights.latestSet ? `${highlights.latestSet.name} · ${new Date(highlights.latestSet.releaseDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` : undefined}
              cards={highlights.newest}
              onSelect={openPokemon}
            />
            <CardRail
              title="Les plus chères"
              subtitle="Prix moyen Cardmarket"
              cards={highlights.priciest}
              onSelect={openPokemon}
            />
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-white">Pokédex</h2>
          <div className="no-scrollbar -mx-4 px-4 flex gap-1.5 overflow-x-auto" role="group" aria-label="Filtrer par type">
            <button
              onClick={() => setTypeFilter(null)}
              aria-pressed={typeFilter === null}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${typeFilter === null ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
            >
              Tous
            </button>
            {TYPE_IDS.map(type => {
              const active = typeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(active ? null : type)}
                  aria-pressed={active}
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors border"
                  style={{
                    backgroundColor: active ? TYPES[type].color : 'transparent',
                    borderColor: `${TYPES[type].color}${active ? '' : '66'}`,
                  }}
                >
                  {TYPES[type].label}
                </button>
              );
            })}
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
        ) : visiblePokemon.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <PokemonArt id={54} className="w-28 h-28 opacity-90" />
            <p className="text-slate-300 mt-3">Aucun Pokémon ne correspond à cette recherche.</p>
            <p className="text-slate-500 text-sm">Même Psykokwak ne comprend pas.</p>
          </div>
        ) : (
          <PokemonGrid items={visiblePokemon} onSelect={setSelected} />
        )}
      </main>

      <PokemonModal pokemon={selected} onClose={closeModal} />
    </div>
  );
}
