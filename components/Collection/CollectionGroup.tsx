import CollectionCard from './CollectionCard';

interface CollectionItem {
  id: number;
  quantity: number;
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
}

interface Props {
  groupName: string;
  items: CollectionItem[];
  onUpdateQuantity: (cardId: string, currentQuantity: number, delta: number) => void;
  onRemove: (cardId: string) => void;
}

export default function CollectionGroup({ groupName, items, onUpdateQuantity, onRemove }: Props) {
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = items.reduce((sum, i) => sum + (i.card.price || 0) * i.quantity, 0);
  const hasPrice = items.some(i => i.card.price);

  return (
    <div>
      <div className="mb-4 pb-3 border-b-2 border-red-500/30">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          {groupName}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {items.length} carte{items.length > 1 ? 's' : ''} • {totalQuantity} exemplaire{totalQuantity > 1 ? 's' : ''}
          {hasPrice && (
            <span className="ml-2">
              • {totalValue.toFixed(2)}€
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
    </div>
  );
}