import { useCallback, useRef, useState } from 'react';
import type { Card } from '@/types';
import { fetchJson } from '@/utils/fetcher';
import { requestDeduplicator } from '../utils/requestDuplicator';

export function usePokemonCards() {
  const cacheRef = useRef<Map<string, Card[]>>(new Map());
  const latestRequestRef = useRef<string | null>(null);

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pokemonName: string) => {
    latestRequestRef.current = pokemonName;
    const isStillCurrent = () => latestRequestRef.current === pokemonName;

    setError(null);
    setIsLoading(true);

    try {
      if (cacheRef.current.has(pokemonName)) {
        const cached = cacheRef.current.get(pokemonName)!;
        if (isStillCurrent()) {
          setCards(cached);
        }
        return cached;
      }

      const data = await requestDeduplicator.dedupe(
        `pokemon-cards-${pokemonName}`,
        async () => {
          const url = `/api/cards?pokemon=${encodeURIComponent(pokemonName)}`;
          return fetchJson(url);
        }
      );

      const normalized = Array.isArray(data) ? data : [];
      cacheRef.current.set(pokemonName, normalized);

      if (isStillCurrent()) {
        setCards(normalized);
      }
      return normalized;
    } catch (err: any) {
      if (isStillCurrent()) {
        setError(err.message || 'Erreur lors du chargement des cartes');
        setCards([]);
      }
      return [];
    } finally {
      if (isStillCurrent()) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    cards,
    load,
    isLoading,
    error,
    clearCache: () => {
      cacheRef.current.clear();
      requestDeduplicator.clear();
    },
  };
}