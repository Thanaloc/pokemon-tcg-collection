import React from 'react';

export function PokemonCardSkeleton() {
  return (
    <div className="relative rounded-2xl shadow-2xl p-4 border border-red-500/20 bg-gradient-to-br from-slate-800/90 to-slate-900/90 animate-pulse">
      <div className="w-full h-28 bg-slate-700/50 rounded-xl mb-3"></div>
      <div className="text-center space-y-2">
        <div className="h-4 bg-slate-700/50 rounded-full w-16 mx-auto"></div>
        <div className="h-5 bg-slate-700/50 rounded w-24 mx-auto"></div>
        <div className="flex justify-center gap-2">
          <div className="h-6 w-12 bg-slate-700/50 rounded-lg"></div>
          <div className="h-6 w-12 bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function CardItemSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-red-500/20 animate-pulse">
      <div className="w-full aspect-[2.5/3.5] bg-slate-700/50 rounded-xl mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-6 bg-slate-700/50 rounded w-20 mx-auto"></div>
        <div className="h-3 bg-slate-700/50 rounded w-12 mx-auto"></div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-9 bg-slate-700/50 rounded-xl"></div>
        <div className="h-9 bg-slate-700/50 rounded-xl"></div>
      </div>
    </div>
  );
}

export function PokemonGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardItemSkeleton key={i} />
      ))}
    </div>
  );
}