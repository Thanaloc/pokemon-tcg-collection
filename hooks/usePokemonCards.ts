import { useCallback, useRef, useState } from 'react';
import type { Card } from '@/types';
import { fetchJson } from '@/utils/fetcher';

export function usePokemonCards() {
  const cacheRef = useRef<Map<string, Card[]>>(new Map());
  
  const loadingRef = useRef<Set<string>>(new Set());
  
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pokemonName: string) => {
    
    if (loadingRef.current.has(pokemonName)) {
      return cacheRef.current.get(pokemonName) || [];
    }

    setError(null);
    setIsLoading(true);
    loadingRef.current.add(pokemonName);

    try {
      // Check cache
      if (cacheRef.current.has(pokemonName)) {
        const cached = cacheRef.current.get(pokemonName)!;
        setCards(cached);
        return cached;
      }

      const url = `/api/cards?pokemon=${encodeURIComponent(pokemonName)}`;
      const data = await fetchJson(url);
      
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
      loadingRef.current.delete(pokemonName);
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
      loadingRef.current.clear();
    }
  };
}