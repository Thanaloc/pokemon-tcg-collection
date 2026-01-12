import React from 'react';
import { useRouter } from 'next/navigation';
import type { Card } from '@/types';
import { RARITY_COLORS } from '@/constants/colors';
import { AlertTriangle } from 'lucide-react';
import { useCollection } from '@/hooks/useCollection';

interface Props {
  card: Card;
  hasPriceWarning: boolean;
  collectionEnabled: boolean;
  ownedQuantity?: number;
  onCardAdded?: (cardId: string) => void;
}

export default function CardItem({ card, hasPriceWarning, collectionEnabled, ownedQuantity = 0, onCardAdded }: Props) {
  const router = useRouter();
  const { addToCollection, isLoading, isAuthenticated } = useCollection();

  const handleAddToCollection = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const success = await addToCollection(card.id);
    if (success && onCardAdded) {
      onCardAdded(card.id);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 
                    hover:shadow-2xl hover:shadow-red-500/30 hover:scale-105 
                    transition-all duration-300 
                    border border-red-500/20 hover:border-red-400/50 
                    relative group">
      
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

      {ownedQuantity > 0 && (
        <div className="absolute top-2 left-2 z-10 
                        bg-gradient-to-r from-green-500 to-emerald-600 
                        text-white text-xs font-bold px-2.5 py-1.5 rounded-lg 
                        flex items-center gap-1 shadow-lg">
          ✓ {ownedQuantity}
        </div>
      )}

      {card.price != null && (
        <div className={`absolute top-2 right-2 z-10 
                        ${hasPriceWarning
                ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600'} 
                        text-white text-xs font-bold px-2.5 py-1.5 rounded-lg 
                        flex items-center gap-1 shadow-lg
                        hover:scale-110 transition-transform`}>
          {hasPriceWarning && <AlertTriangle size={12} />}
          {card.price.toFixed(2)}€
        </div>
      )}

      <img 
        src={card.smallImage} 
        alt={card.name} 
        className="w-full rounded-xl shadow-lg mb-3 border border-red-500/10 group-hover:shadow-red-500/30 transition-shadow" 
        loading="lazy" 
      />

      <div className="text-sm space-y-2 relative z-10">
        <p className="font-bold text-white truncate text-center">{card.set}</p>
        <div className="flex justify-center mt-1">
          <span className={`inline-block text-xs px-3 py-1.5 rounded-lg font-bold shadow-md ${RARITY_COLORS[card.rarity] || 'bg-gray-100'}`}>
            {card.rarity}
          </span>
        </div>
        <div className="flex items-center justify-center text-xs text-red-300/70 font-mono mt-1">
          <span>#{card.number}</span>
        </div>
      </div>

      {hasPriceWarning && card.price && (
        <div className="mt-2 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-xs text-orange-200 relative z-10">
          ⚠️ Possibly incorrect price (multiple versions)
        </div>
      )}

      <div className="mt-3 space-y-2 relative z-10">
        {card.cardmarketUrl && (
          <a 
            href={card.cardmarketUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full py-2.5 text-xs 
                       bg-gradient-to-r from-red-600 to-orange-600 
                       hover:from-red-500 hover:to-orange-500
                       text-white rounded-xl text-center font-bold 
                       shadow-lg hover:shadow-xl hover:shadow-red-500/50
                       transform hover:scale-105
                       transition-all duration-200"
          >
            📊 View on Cardmarket
          </a>
        )}
        
        <button 
          onClick={handleAddToCollection}
          disabled={!collectionEnabled || isLoading} 
          title={!collectionEnabled ? "Coming soon" : !isAuthenticated ? "Login to add to collection" : ""} 
          className={`w-full py-2.5 text-xs rounded-xl font-bold transition-all duration-200
                     ${collectionEnabled && !isLoading
                       ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                       : 'bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-50 border border-slate-700/50'}`}
        >
          {isLoading ? '⏳ Adding...' : ownedQuantity > 0 ? '+ Add Another' : '⭐ Add to Collection'}
        </button>
      </div>
    </div>
  );
}