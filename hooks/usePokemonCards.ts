import { useCallback, useRef, useState } from 'react';
import type { Card } from '@/types';
import { fetchJson } from '@/utils/fetcher';
import { requestDeduplicator } from '../utils/requestDuplicator';

export function usePokemonCards() {
  const cacheRef = useRef<Map<number, Card[]>>(new Map());
  const latestRequestRef = useRef<number | null>(null);

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pokemonId: number) => {
    latestRequestRef.current = pokemonId;
    const isStillCurrent = () => latestRequestRef.current === pokemonId;

    setError(null);
    setIsLoading(true);

    try {
      if (cacheRef.current.has(pokemonId)) {
        const cached = cacheRef.current.get(pokemonId)!;
        if (isStillCurrent()) {
          setCards(cached);
        }
        return cached;
      }

      const data = await requestDeduplicator.dedupe(
        `pokemon-cards-${pokemonId}`,
        async () => {
          // `v` changes whenever the response shape changes, to bypass CDN-cached copies.
          const url = `/api/cards?pokemonId=${pokemonId}&v=2`;
          return fetchJson(url);
        }
      );

      const normalized = Array.isArray(data) ? data : [];
      cacheRef.current.set(pokemonId, normalized);

      if (isStillCurrent()) {
        setCards(normalized);
      }
      return normalized;
    } catch (err) {
      if (isStillCurrent()) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cartes');
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