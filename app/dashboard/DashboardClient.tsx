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
    if (!confirm('Retirer cette carte du dashboard ?')) return;
    const res = await fetch(`/api/dashboard/pins?cardId=${encodeURIComponent(cardId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPins(prev => prev.filter(p => p.card.id !== cardId));
    }
  };

  if (pins.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-red-500/20 rounded-2xl p-12 text-center">
        <p className="text-white text-lg mb-2">Aucune carte épinglée pour l&apos;instant.</p>
        <p className="text-red-200/70">
          Épingle une carte depuis la modal d&apos;un Pokémon pour suivre l&apos;évolution de son prix ici.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {RANGE_LABELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
              (range === value
                ? 'bg-red-500 text-white'
                : 'bg-slate-700 text-red-200 hover:bg-slate-600')
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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