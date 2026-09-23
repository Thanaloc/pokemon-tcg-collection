import React from 'react';
import { Search, X } from 'lucide-react';
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

const selectClass = `bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-white
  hover:border-slate-700 focus:outline-none focus:border-slate-600 cursor-pointer`;

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
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        <input
          type="search"
          placeholder="Filtrer par set ou série"
          aria-label="Filtrer par set ou série"
          value={cardSearchTerm}
          onChange={(e) => onCardSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-md
                     text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={sortBy} onChange={(e) => onSortBy(e.target.value)} aria-label="Trier" className={selectClass}>
          <option value="rarity">Rareté</option>
          <option value="date-desc">Sortie : plus récentes</option>
          <option value="date-asc">Sortie : plus anciennes</option>
          <option value="set">Nom du set</option>
          <option value="number">Numéro</option>
          <option value="price">Prix</option>
        </select>

        {uniqueRarities.length > 1 && (
          <select value={filterRarity} onChange={(e) => onFilterRarity(e.target.value)} aria-label="Filtrer par rareté" className={selectClass}>
            <option value="all">Toutes raretés</option>
            {uniqueRarities.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}

        {uniqueSeries.length > 1 && (
          <select value={filterSeries} onChange={(e) => onFilterSeries(e.target.value)} aria-label="Filtrer par série" className={selectClass}>
            <option value="all">Toutes séries</option>
            {uniqueSeries.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
