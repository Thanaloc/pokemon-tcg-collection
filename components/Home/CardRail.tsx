'use client';

import { isFoilRarity } from '@/constants/rarities';
import CardImage, { hasCardImage } from '@/components/ui/CardImage';
import HoloCard from '@/components/ui/HoloCard';

export interface RailCard {
  id: string;
  name: string;
  number: string;
  rarity: string;
  set: string;
  smallImage: string | null;
  price: number | null;
  pokemonId: number;
}

interface Props {
  cards: RailCard[];
  onSelect: (pokemonId: number) => void;
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

/** Horizontal strip of cards; clicking one opens its Pokémon. */
export default function CardRail({ cards, onSelect }: Props) {
  if (cards.length === 0) return null;

  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 pt-1 snap-x">
        {cards.map(card => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.pokemonId)}
            className="w-28 sm:w-32 shrink-0 snap-start text-left rounded-lg transition active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={`${card.name}, ${card.set}`}
          >
            <HoloCard foil={isFoilRarity(card.rarity) && hasCardImage(card.smallImage)}>
              <CardImage src={card.smallImage} alt="" className="shadow-lg shadow-black/40" />
            </HoloCard>
            <p className="mt-2 text-sm font-medium text-white truncate">{card.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {card.set}
              {card.price != null && <span className="text-slate-300"> · {euros.format(card.price)}</span>}
            </p>
          </button>
        ))}
    </div>
  );
}
