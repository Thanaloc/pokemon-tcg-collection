import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (s: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
      
      <div className="relative">
        <Search 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/100 group-hover:text-white transition-colors" 
          size={22} 
        />
        <input
          type="text"
          placeholder="Rechercher un Pokémon par nom ou numéro..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-slate-800/70 backdrop-blur-md border-2 border-red-500/30 rounded-2xl
                     focus:ring-4 focus:ring-red-500/40 focus:border-red-400 
                     hover:border-red-400/50 
                     transition-all duration-300 
                     text-white placeholder-white/40 text-lg
                     shadow-xl hover:shadow-2xl hover:shadow-red-500/20"
        />
      </div>
    </div>
  );
}