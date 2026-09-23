import React from 'react';
import { useRouter } from 'next/navigation';
import type { Card } from '@/types';
import { isFoilRarity, rarityClass } from '@/constants/rarities';
import { AlertTriangle, Check, ExternalLink, Pin, Plus } from 'lucide-react';
import { useCollection } from '@/hooks/useCollection';
import CardImage, { hasCardImage } from '@/components/ui/CardImage';
import HoloCard from '@/components/ui/HoloCard';

interface Props {
  card: Card;
  hasPriceWarning: boolean;
  collectionEnabled: boolean;
  ownedQuantity?: number;
  onCardAdded?: (cardId: string) => void;
  isPinned: boolean;
  onTogglePin: (cardId: string) => void;
  isPinLoading?: boolean;
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const iconButton = 'p-2 rounded-md border transition active:scale-[0.94] disabled:opacity-50';
const iconIdle = 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-600';
const iconActive = 'border-amber-500/40 text-amber-400 hover:text-amber-300';

export default function CardItem({
  card,
  hasPriceWarning,
  collectionEnabled,
  ownedQuantity = 0,
  onCardAdded,
  isPinned,
  onTogglePin,
  isPinLoading = false,
}: Props) {
  const router = useRouter();
  const { addToCollection, isLoading, isAuthenticated } = useCollection();

  const handleAddToCollection = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const success = await addToCollection(card.id);
    if (success && onCardAdded) onCardAdded(card.id);
  };

  const handleTogglePin = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    onTogglePin(card.id);
  };

  return (
    <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900 p-2.5">
      <div className="relative">
        <HoloCard foil={isFoilRarity(card.rarity) && hasCardImage(card.smallImage)}>
          <CardImage src={card.smallImage} alt={`${card.name} — ${card.set} #${card.number}`} />
        </HoloCard>
        {ownedQuantity > 0 && (
          <span
            className="absolute z-10 top-1.5 left-1.5 flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-semibold text-white"
            title={`${ownedQuantity} dans votre collection`}
          >
            <Check size={12} /> {ownedQuantity}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex-1 space-y-1.5">
        <p className="text-sm font-medium text-white truncate" title={card.set}>{card.set}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500 tabular-nums">#{card.number}</span>
          <span className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${rarityClass(card.rarity)}`} title={card.rarity}>
            {card.rarity}
          </span>
        </div>
        <p className="text-sm tabular-nums">
          {card.price != null ? (
            <span
              className={`inline-flex items-center gap-1 ${hasPriceWarning ? 'text-amber-400' : 'text-slate-200'}`}
              title={hasPriceWarning ? 'Prix possiblement imprécis : plusieurs versions de cette carte existent dans ce set' : undefined}
            >
              {hasPriceWarning && <AlertTriangle size={13} />}
              {euros.format(card.price)}
            </span>
          ) : (
            <span className="text-slate-600">Prix inconnu</span>
          )}
        </p>
      </div>

      <div className="mt-2.5 flex gap-1.5">
        <button
          onClick={handleAddToCollection}
          disabled={!collectionEnabled || isLoading}
          title={!isAuthenticated ? 'Connectez-vous pour ajouter à la collection' : undefined}
          className="flex-1 flex items-center justify-center gap-1 rounded-md bg-slate-800 px-2 py-2 text-xs font-medium text-white
                     hover:bg-slate-700 transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          {isLoading ? 'Ajout…' : ownedQuantity > 0 ? 'Exemplaire' : 'Collection'}
        </button>

        <button
          onClick={handleTogglePin}
          disabled={isPinLoading}
          aria-pressed={isPinned}
          title={!isAuthenticated ? 'Connectez-vous pour suivre le prix' : isPinned ? 'Ne plus suivre le prix' : 'Suivre le prix'}
          aria-label={isPinned ? 'Ne plus suivre le prix' : 'Suivre le prix'}
          className={`${iconButton} ${isPinned ? iconActive : iconIdle}`}
        >
          {isPinned ? <Pin size={15} fill="currentColor" /> : <Pin size={15} />}
        </button>

        {card.cardmarketUrl && (
          <a
            href={card.cardmarketUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Voir sur Cardmarket"
            aria-label="Voir sur Cardmarket"
            className={`${iconButton} ${iconIdle}`}
          >
            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </div>
  );
}
