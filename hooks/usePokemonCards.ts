import { useCallback, useRef, useState } from 'react';
import type { Card } from '@/types';
import { fetchJson } from '@/utils/fetcher';
import { requestDeduplicator } from '../utils/requestDuplicator';

export function usePokemonCards() {
  const cacheRef = useRef<Map<string, Card[]>>(new Map());
  
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pokemonName: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // Check cache first
      if (cacheRef.current.has(pokemonName)) {
        const cached = cacheRef.current.get(pokemonName)!;
        setCards(cached);
        setIsLoading(false);
        return cached;
      }

      // Deduplicate concurrent requests for same Pokemon
      const data = await requestDeduplicator.dedupe(
        `pokemon-cards-${pokemonName}`,
        async () => {
          const url = `/api/cards?pokemon=${encodeURIComponent(pokemonName)}`;
          return fetchJson(url);
        }
      );
      
      if (!Array.isArray(data)) {
        setCards([]);
        cacheRef.current.set(pokemonName, []);
        return [];
      }

      cacheRef.current.set(pokemonName, data);
      setCards(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des cartes');
      setCards([]);
      return [];
    } finally {
      setIsLoading(false);
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
    }
  };
}