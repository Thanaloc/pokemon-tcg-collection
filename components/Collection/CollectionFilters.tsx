import { Search } from 'lucide-react';
import type { CollectionSort } from '@/types';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: CollectionSort;
  onSortChange: (value: CollectionSort) => void;
}

export default function CollectionFilters({ searchTerm, onSearchChange, sortBy, onSortChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
      <div className="relative sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        <input
          type="search"
          placeholder="Pokémon, carte, set…"
          aria-label="Rechercher dans la collection"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-md
                   text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
        />
      </div>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as CollectionSort)}
        aria-label="Trier la collection"
        className="px-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-md text-white
                 focus:outline-none focus:border-slate-600 cursor-pointer"
      >
        <option value="set">Par set (récents d&apos;abord)</option>
        <option value="pokemon">Par Pokémon</option>
        <option value="price">Par prix</option>
        <option value="quantity">Par quantité</option>
        <option value="recent">Ajouts récents</option>
      </select>
    </div>
  );
}
