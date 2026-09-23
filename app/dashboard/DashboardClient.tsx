'use client';

import { useState } from 'react';
import PinnedCardChart from './PinnedCardChart';

type Pin = {
  id: number;
  pinnedAt: string;
  card: {
    id: string;
    name: string;
    number: string;
    rarity: string;
    image: string;
    smallImage: string;
    set: string;
    series: string;
    currentPrice: number | null;
    cardmarketUrl: string;
    pokemon: { id: number; name: string };
  };
};

type Range = '7d' | '30d' | '90d' | 'all';

interface Props {
  initialPins: Pin[];
}

const RANGE_LABELS: { value: Range; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: 'all', label: 'Tout' },
];

export default function DashboardClient({ initialPins }: Props) {
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [range, setRange] = useState<Range>('30d');

  const handleUnpin = async (cardId: string) => {
    if (!confirm('Ne plus suivre le prix de cette carte ?')) return;
    const res = await fetch(`/api/dashboard/pins?cardId=${encodeURIComponent(cardId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPins(prev => prev.filter(p => p.card.id !== cardId));
    }
  };

  if (pins.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-800 p-10 text-center">
        <p className="text-white font-medium">Aucune carte suivie pour l&apos;instant</p>
        <p className="text-slate-400 text-sm mt-1">
          Ouvrez un Pokémon et cliquez sur l&apos;épingle d&apos;une carte pour suivre son prix ici.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="inline-flex rounded-md border border-slate-800 p-0.5 mb-6">
        {RANGE_LABELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={
              'px-3 py-1.5 rounded text-sm transition-colors ' +
              (range === value
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white')
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pins.map(pin => (
          <PinnedCardChart
            key={pin.id}
            pin={pin}
            range={range}
            onUnpin={() => handleUnpin(pin.card.id)}
          />
        ))}
      </div>
    </div>
  );
}