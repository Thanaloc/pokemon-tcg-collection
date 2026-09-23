import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Pokemon } from '@/types';
import { fetchJson } from '@/utils/fetcher';
import { useDebounce } from './useDebounce';

// "Salameche" finds Salamèche, "mr mime" finds M. Mime.
function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

export function usePokemonData() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const load = useCallback(async () => {
    try {
      const data = await fetchJson('/api/pokemon');
      if (!Array.isArray(data)) throw new Error('Invalid data format from /api/pokemon');
      setAllPokemon(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des Pokémon');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // load() only sets state once the fetch has resolved.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const searchIndex = useMemo(
    () => allPokemon.map(p => `${normalize(p.name)}|${normalize(p.nameEn ?? '')}`),
    [allPokemon],
  );

  const filteredPokemon = useMemo(() => {
    const query = debouncedSearchTerm.trim();
    if (!query) return allPokemon;
    const normalized = normalize(query);
    const isNumber = /^\d+$/.test(query);
    return allPokemon.filter((p, index) =>
      isNumber ? p.number.includes(query) || String(p.id) === query : searchIndex[index].includes(normalized)
    );
  }, [debouncedSearchTerm, allPokemon, searchIndex]);

  const cardCount = useMemo(
    () => allPokemon.reduce((sum, p) => sum + (p.cardCount ?? 0), 0),
    [allPokemon],
  );

  return {
    allPokemon,
    filteredPokemon,
    cardCount,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    reload: async () => {
      setIsLoading(true);
      setError(null);
      await load();
    },
  };
}
