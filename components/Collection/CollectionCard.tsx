import { Trash2, Plus, Minus } from 'lucide-react';
import CardImage, { hasCardImage } from '@/components/ui/CardImage';
import HoloCard from '@/components/ui/HoloCard';
import { isFoilRarity } from '@/constants/rarities';

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

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const stepButton = `p-1.5 rounded-md border border-slate-800 text-slate-300
  hover:text-white hover:border-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`;

export default function CollectionCard({ card, quantity, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900 p-2.5">
      <HoloCard foil={isFoilRarity(card.rarity) && hasCardImage(card.smallImage)}>
        <CardImage src={card.smallImage} alt={`${card.name} — ${card.set} #${card.number}`} />
      </HoloCard>

      <div className="mt-2.5 flex-1">
        <p className="text-sm font-medium text-white truncate">{card.pokemon.name}</p>
        <p className="text-xs text-slate-500 truncate">{card.set} · #{card.number}</p>
        <p className="text-sm text-slate-200 tabular-nums mt-1">
          {card.price != null ? (
            <>
              {euros.format(card.price * quantity)}
              {quantity > 1 && <span className="text-xs text-slate-500"> ({euros.format(card.price)} ×{quantity})</span>}
            </>
          ) : (
            <span className="text-slate-600">Prix inconnu</span>
          )}
        </p>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          onClick={() => onUpdateQuantity(card.id, quantity, -1)}
          disabled={quantity <= 1}
          aria-label="Retirer un exemplaire"
          className={stepButton}
        >
          <Minus size={14} />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-white tabular-nums" aria-label="Quantité">
          {quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(card.id, quantity, 1)}
          aria-label="Ajouter un exemplaire"
          className={stepButton}
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => onRemove(card.id)}
          aria-label="Retirer de la collection"
          title="Retirer de la collection"
          className="p-1.5 rounded-md text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
