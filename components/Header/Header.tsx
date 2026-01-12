'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SearchBar from './SearchBar';
import Stats from './Stats';
import UserMenu from './UserMenu';

interface Props {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  pokemonCount: number;
  isLoading: boolean;
}

export default function Header({ searchTerm, setSearchTerm, pokemonCount, isLoading }: Props) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 px-6 py-8 border-b border-red-500/20 bg-gradient-to-r from-slate-900/95 via-red-900/40 to-slate-900/95 backdrop-blur-xl shadow-2xl">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60V20z' fill='none' stroke='%23ef4444' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: "70px 70px",
          maskImage: "linear-gradient(to bottom, transparent, black, black, transparent)"
        }}></div>

        <div className="absolute -top-20 -left-28 w-80 h-80 bg-red-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute top-32 right-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full"></div>
      </div>

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

          <div className="flex items-center gap-4">
            {!isLoading && <Stats pokemonCount={pokemonCount} />}
            
            {session?.user ? (
              <div className="flex items-center gap-3">
                {/* Ma Collection Button - Option 2 with mini Pokeball */}
                <Link 
                  href="/collection" 
                  className="group relative px-5 py-2.5 
                           bg-slate-800/90 hover:bg-slate-700/90
                           rounded-xl font-bold text-white
                           border-2 border-red-500/40 hover:border-red-400/60
                           shadow-lg hover:shadow-xl hover:shadow-red-500/40
                           transition-all duration-200
                           transform hover:scale-105
                           flex items-center gap-3"
                >
                  {/* Mini Pokeball */}
                  <div className="relative w-5 h-5 flex-shrink-0 group-hover:rotate-180 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-600"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full bg-white"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 transform -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full border border-slate-900 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  <span>Ma Collection</span>
                </Link>
                
                <UserMenu user={session.user} />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="px-5 py-2.5 
                           bg-slate-800/90 hover:bg-slate-700/90
                           rounded-xl font-medium text-white
                           border-2 border-slate-600/50 hover:border-slate-500/60
                           transition-all duration-200
                           transform hover:scale-105"
                >
                  Connexion
                </Link>
                
                <Link 
                  href="/register" 
                  className="px-5 py-2.5
                           bg-gradient-to-r from-red-600 to-orange-600 
                           hover:from-red-500 hover:to-orange-500
                           rounded-xl font-bold text-white
                           shadow-lg hover:shadow-xl hover:shadow-red-500/50
                           transition-all duration-200
                           transform hover:scale-105
                           border-2 border-red-400/30"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>

        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>
    </header>
  );
}