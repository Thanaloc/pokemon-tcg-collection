import Link from 'next/link';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: 'set' | 'pokemon' | 'price' | 'quantity';
  onSortChange: (value: 'set' | 'pokemon' | 'price' | 'quantity') => void;
}

export default function CollectionFilters({ searchTerm, onSearchChange, sortBy, onSortChange }: Props) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <Link 
        href="/" 
        className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 
                 hover:from-red-500 hover:to-orange-500
                 text-white rounded-xl font-bold shadow-lg 
                 hover:shadow-xl hover:shadow-red-500/50
                 transform hover:scale-105
                 transition-all duration-200 flex items-center gap-2"
      >
        ← Retour à l'accueil
      </Link>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-4 py-2 bg-slate-800 border-2 border-red-500/30 rounded-xl
                   text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        />
        
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="px-4 py-2 bg-slate-800 border-2 border-red-500/30 rounded-xl
                   text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
        >
          <option value="set">Trier par Set</option>
          <option value="pokemon">Trier par Pokémon</option>
          <option value="price">Trier par Prix</option>
          <option value="quantity">Trier par Quantité</option>
        </select>
      </div>
    </div>
  );
}