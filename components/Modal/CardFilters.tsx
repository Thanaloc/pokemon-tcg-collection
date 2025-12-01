import React from 'react';
import { Search, SortAsc, Filter, X } from 'lucide-react';
import type { SortOption } from '@/types';

interface Props {
  cardSearchTerm: string;
  onCardSearchTerm: (s: string) => void;
  sortBy: SortOption;
  onSortBy: (s: string) => void;
  filterRarity: string;
  onFilterRarity: (s: string) => void;
  filterSeries: string;
  onFilterSeries: (s: string) => void;
  uniqueRarities: string[];
  uniqueSeries: string[];
  onReset: () => void;
}

export default function CardFilters({
  cardSearchTerm,
  onCardSearchTerm,
  sortBy,
  onSortBy,
  filterRarity,
  onFilterRarity,
  filterSeries,
  onFilterSeries,
  uniqueRarities,
  uniqueSeries,
  onReset
}: Props) {
  const hasActiveFilters = cardSearchTerm || filterRarity !== 'all' || filterSeries !== 'all';

  return (
    <div className="space-y-4">
      
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
        
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 group-hover:text-white transition-colors" 
            size={20} 
          />
          <input
            type="text"
            placeholder="Rechercher par set ou série..."
            value={cardSearchTerm}
            onChange={(e) => onCardSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm 
                       bg-slate-800/80 backdrop-blur-md 
                       border-2 border-red-500/30 rounded-xl 
                       focus:ring-4 focus:ring-red-500/40 focus:border-red-400 
                       hover:border-red-400/50 hover:bg-slate-800
                       transition-all duration-300
                       text-white placeholder-white/40
                       shadow-lg hover:shadow-xl hover:shadow-red-500/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Tri */}
        <div className="flex items-center gap-2 bg-slate-800/50 border-2 border-red-500/30 rounded-xl px-3 py-2 hover:border-red-400/50 transition-all">
          <SortAsc size={16} className="text-red-400 flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortBy(e.target.value)}
            className="bg-transparent text-white text-sm cursor-pointer focus:outline-none"
          >
            <option value="set" className="bg-slate-800">Par Set</option>
            <option value="rarity" className="bg-slate-800">Par Rareté</option>
            <option value="number" className="bg-slate-800">Par Numéro</option>
            <option value="price" className="bg-slate-800">Par Prix</option>
          </select>
        </div>

        {/* Filtre rareté */}
        {uniqueRarities.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-800/50 border-2 border-red-500/30 rounded-xl px-3 py-2 hover:border-red-400/50 transition-all">
            <Filter size={16} className="text-red-400 flex-shrink-0" />
            <select
              value={filterRarity}
              onChange={(e) => onFilterRarity(e.target.value)}
              className="bg-transparent text-white text-sm cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-slate-800">Toutes raretés</option>
              {uniqueRarities.map(r => (
                <option key={r} value={r} className="bg-slate-800">{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtre série */}
        {uniqueSeries.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-800/50 border-2 border-red-500/30 rounded-xl px-3 py-2 hover:border-red-400/50 transition-all">
            <Filter size={16} className="text-red-400 flex-shrink-0" />
            <select
              value={filterSeries}
              onChange={(e) => onFilterSeries(e.target.value)}
              className="bg-transparent text-white text-sm cursor-pointer focus:outline-none"
            >
              <option value="all" className="bg-slate-800">Toutes séries</option>
              {uniqueSeries.map(s => (
                <option key={s} value={s} className="bg-slate-800">{s}</option>
              ))}
            </select>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 
                       bg-red-600/20 hover:bg-red-600/40
                       border-2 border-red-500/40 hover:border-red-400/60
                       text-red-200 hover:text-red-100
                       font-medium rounded-xl text-sm
                       transition-all duration-200
                       hover:shadow-lg hover:shadow-red-500/30"
          >
            <X size={16} />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}