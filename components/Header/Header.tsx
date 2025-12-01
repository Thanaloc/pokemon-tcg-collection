import React from 'react';
import SearchBar from './SearchBar';
import Stats from './Stats';

interface Props {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  pokemonCount: number;
  isLoading: boolean;
}

export default function Header({ searchTerm, setSearchTerm, pokemonCount, isLoading }: Props) {
  return (
    <header className="sticky top-0 z-40 px-6 py-8 border-b border-red-500/20 bg-gradient-to-r from-slate-900/95 via-red-900/40 to-slate-900/95 backdrop-blur-xl overflow-hidden shadow-2xl">
      
      {/* Motif hexagonal */}
      <div className="absolute inset-0 opacity-[0.12]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60V20z' fill='none' stroke='%23ef4444' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundSize: "70px 70px",
        maskImage: "linear-gradient(to bottom, transparent, black, black, transparent)"
      }}></div>

      {/* Halos de lumière */}
      <div className="absolute -top-20 -left-28 w-80 h-80 bg-red-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute top-32 right-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            
            <div className="relative w-14 h-14 flex-shrink-0">
              <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-red-500 via-white to-red-500 opacity-80"></div>
              <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg"></div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full border-2 border-slate-900 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 drop-shadow-lg">
                Pokémon TCG
              </h1>
              <p className="text-sm text-red-200/80 mt-1 font-medium">Collection complète de cartes</p>
            </div>
          </div>

          {!isLoading && <Stats pokemonCount={pokemonCount} />}
        </div>

        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>
    </header>
  );
}