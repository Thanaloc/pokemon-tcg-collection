import { Trash2, Plus, Minus } from 'lucide-react';

interface Props {
  card: {
    id: string;
    name: string;
    number: string;
    rarity: string;
    smallImage: string;
    set: string;
    price: number | null;
    pokemon: {
      name: string;
    };
  };
  quantity: number;
  onUpdateQuantity: (cardId: string, currentQuantity: number, delta: number) => void;
  onRemove: (cardId: string) => void;
}

export default function CollectionCard({ card, quantity, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 
                 border border-red-500/20 hover:border-red-400/50 
                 hover:shadow-2xl hover:shadow-red-500/30
                 transition-all duration-300 relative group">
      <img
        src={card.smallImage}
        alt={card.name}
        className="w-full rounded-lg shadow-lg mb-2 border border-red-500/10"
      />

      <div className="text-xs space-y-1">
        <p className="font-bold text-white truncate text-center">{card.pokemon.name}</p>
        <p className="text-slate-400 text-xs truncate text-center">{card.set}</p>
        <p className="text-slate-500 text-xs text-center">#{card.number}</p>
        
        {card.price && (
          <p className="text-green-400 font-bold text-xs text-center">
            {(card.price * quantity).toFixed(2)}€
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(card.id, quantity, -1)}
          disabled={quantity <= 1}
          className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   text-white rounded-lg transition-all duration-200
                   hover:shadow-lg hover:scale-105
                   flex items-center justify-center text-xs"
        >
          <Minus size={14} />
        </button>
        
        <div className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg">
          <span className="text-white font-bold text-xs">{quantity}</span>
        </div>
        
        <button
          onClick={() => onUpdateQuantity(card.id, quantity, 1)}
          className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 
                   text-white rounded-lg transition-all duration-200
                   hover:shadow-lg hover:scale-105
                   flex items-center justify-center text-xs"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        onClick={() => onRemove(card.id)}
        className="mt-2 w-full py-1.5 bg-red-600/20 hover:bg-red-600/40 
                 text-red-400 rounded-lg transition-all duration-200
                 hover:shadow-lg hover:scale-105
                 flex items-center justify-center gap-1 text-xs"
      >
        <Trash2 size={12} />
        Retirer
      </button>
    </div>
  );
}