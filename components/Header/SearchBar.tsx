import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (s: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
      <input
        type="search"
        aria-label="Rechercher un Pokémon"
        placeholder="Nom (FR ou EN) ou numéro de Pokédex"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg
                   text-white placeholder-slate-500
                   focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-red-500/30
                   transition-colors"
      />
    </div>
  );
}
