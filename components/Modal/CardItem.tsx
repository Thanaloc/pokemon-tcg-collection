import React from 'react';
import type { Card } from '@/types';
import { RARITY_COLORS } from '@/constants/colors';
import { AlertTriangle } from 'lucide-react';

interface Props {
  card: Card;
  hasPriceWarning: boolean;
  collectionEnabled: boolean;
}

export default function CardItem({ card, hasPriceWarning, collectionEnabled }: Props) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 
                    hover:shadow-2xl hover:shadow-red-500/30 hover:scale-105 
                    transition-all duration-300 
                    border border-red-500/20 hover:border-red-400/50 
                    relative group">
      
      {/* Effet glow au hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

      {/* Badge prix */}
      {card.price != null && (
        <div className={`absolute top-2 right-2 z-10 
                        ${hasPriceWarning ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600'} 
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

      {/* Warning prix */}
      {hasPriceWarning && card.price && (
        <div className="mt-2 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-xs text-orange-200 relative z-10">
          ⚠️ Prix possiblement erroné (plusieurs versions)
        </div>
      )}

      {/* Boutons */}
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
            📊 Voir sur Cardmarket
          </a>
        )}
        
        <button 
          disabled={!collectionEnabled} 
          title={!collectionEnabled ? "Bientôt disponible" : ""} 
          className={`w-full py-2.5 text-xs rounded-xl font-bold transition-all duration-200
                     ${collectionEnabled 
                       ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                       : 'bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-50 border border-slate-700/50'}`}
        >
          ⭐ Ma collection
        </button>
      </div>
    </div>
  );
}