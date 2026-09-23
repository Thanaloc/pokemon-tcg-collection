import CollectionCard from './CollectionCard';
import type { CollectionItem } from '@/types';

interface Props {
  groupName: string;
  items: CollectionItem[];
  onUpdateQuantity: (cardId: string, currentQuantity: number, delta: number) => void;
  onRemove: (cardId: string) => void;
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

export default function CollectionGroup({ groupName, items, onUpdateQuantity, onRemove }: Props) {
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = items.reduce((sum, i) => sum + (i.card.price || 0) * i.quantity, 0);
  const hasPrice = items.some(i => i.card.price);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-slate-800 pb-2">
        <h2 className="text-lg font-semibold text-white truncate">{groupName}</h2>
        <p className="text-xs text-slate-500 shrink-0 tabular-nums">
          {items.length} carte{items.length > 1 ? 's' : ''} · {totalQuantity} ex.
          {hasPrice && <> · {euros.format(totalValue)}</>}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map((item) => (
          <CollectionCard
            key={item.id}
            card={item.card}
            quantity={item.quantity}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
