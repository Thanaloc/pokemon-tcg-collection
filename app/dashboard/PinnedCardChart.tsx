'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';
import CardImage from '@/components/ui/CardImage';

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

type HistoryPoint = {
  snapshotAt: string;
  cardmarketPrice: number;
  confidence: 'HIGH' | 'LOW';
};

interface Props {
  pin: {
    id: number;
    card: {
      id: string;
      name: string;
      number: string;
      set: string;
      smallImage: string;
      currentPrice: number | null;
      cardmarketUrl: string;
    };
  };
  range: '7d' | '30d' | '90d' | 'all';
  onUnpin: () => void;
}

export default function PinnedCardChart({ pin, range, onUnpin }: Props) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Loading is derived: true until the response for the current range arrives.
  const requestKey = `${pin.card.id}|${range}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/cards/${encodeURIComponent(pin.card.id)}/price-history?range=${range}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setHistory(data.history || []);
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoadedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [pin.card.id, range, requestKey]);

  const hasLowConfidence = history.some(h => h.confidence === 'LOW');

  const chartData = history.map(h => ({
    date: new Date(h.snapshotAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    price: h.cardmarketPrice,
  }));

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start gap-4 mb-4">
        <a
          href={pin.card.cardmarketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 flex-1 min-w-0 group"
          title="Voir sur Cardmarket (cartes FR)"
        >
          <div className="w-14 shrink-0">
            <CardImage src={pin.card.smallImage} alt={pin.card.name} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate flex items-center gap-1.5 group-hover:underline underline-offset-2">
              <span className="truncate">{pin.card.name}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
            </h3>
            <p className="text-slate-500 text-sm truncate">
              {pin.card.set} · #{pin.card.number}
            </p>
            <p className="text-white text-lg font-semibold mt-1 tabular-nums">
              {pin.card.currentPrice != null ? euros.format(pin.card.currentPrice) : '—'}
            </p>
            {hasLowConfidence && (
              <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                <AlertTriangle size={12} />
                <span>Prix possiblement imprécis</span>
              </div>
            )}
          </div>
        </a>
        <button
          onClick={onUnpin}
          className="text-slate-500 hover:text-white transition-colors p-1"
          title="Ne plus suivre"
          aria-label="Ne plus suivre"
        >
          <X size={18} />
        </button>
      </div>

      <div className="h-48">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Chargement…
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-400 text-sm">
            Erreur : {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Pas encore d&apos;historique : le premier relevé arrive demain.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(v: number) => `${v.toFixed(0)}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : Number(value);
                  return [Number.isFinite(num) ? euros.format(num) : '—', 'Prix'];
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}