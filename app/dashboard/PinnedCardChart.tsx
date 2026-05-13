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
import { buildCardmarketUrl } from '@/lib/cardmarket';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/cards/${encodeURIComponent(pin.card.id)}/price-history?range=${range}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setHistory(data.history || []);
        setIsLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pin.card.id, range]);

  const hasLowConfidence = history.some(h => h.confidence === 'LOW');

  const chartData = history.map(h => ({
    date: new Date(h.snapshotAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    price: h.cardmarketPrice,
  }));

  return (
    <div className="bg-slate-800/40 border border-red-500/20 rounded-2xl p-4">
      <div className="flex items-start gap-4 mb-4">
        <a
          href={pin.card.cardmarketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 flex-1 min-w-0 group"
          title="Voir sur Cardmarket (cartes FR)"
        >
          <img
            src={pin.card.smallImage}
            alt={pin.card.name}
            className="w-16 h-22 object-contain rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate flex items-center gap-1.5 group-hover:text-red-200 transition-colors">
              <span className="truncate">{pin.card.name}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
            </h3>
            <p className="text-red-200/70 text-sm truncate">
              {pin.card.set} · #{pin.card.number}
            </p>
            <p className="text-white text-lg font-black mt-1">
              {pin.card.currentPrice != null
                ? `${pin.card.currentPrice.toFixed(2)} €`
                : '—'}
            </p>
            {hasLowConfidence && (
              <div className="flex items-center gap-1 text-orange-400 text-xs mt-1">
                <AlertTriangle size={12} />
                <span>Prix possiblement imprécis</span>
              </div>
            )}
          </div>
        </a>
        <button
          onClick={onUnpin}
          className="text-red-300 hover:text-red-100 transition-colors p-1"
          title="Retirer du dashboard"
        >
          <X size={18} />
        </button>
      </div>

      <div className="h-48">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-red-200/60 text-sm">
            Chargement…
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-400 text-sm">
            Erreur : {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-red-200/60 text-sm">
            Pas encore d&apos;historique. Reviens demain après le cron de snapshot.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#fca5a5" fontSize={11} />
              <YAxis
                stroke="#fca5a5"
                fontSize={11}
                tickFormatter={(v: number) => `${v.toFixed(0)}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fca5a5' }}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : Number(value);
                  return [Number.isFinite(num) ? `${num.toFixed(2)} €` : '—', 'Prix'];
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ef4444' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}