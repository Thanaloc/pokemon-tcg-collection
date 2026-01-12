import { useEffect, useState, useRef } from 'react';
import type { Pokemon } from '@/types';
import { fetchJson } from '@/utils/fetcher';
import { useDebounce } from './useDebounce';

export function usePokemonData() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Pokemon[] | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (cacheRef.current && cacheRef.current.length > 0) {
          setAllPokemon(cacheRef.current);
          setFilteredPokemon(cacheRef.current);
          setIsLoading(false);
          return;
        }

        const data = await fetchJson('/api/pokemon');
        if (!Array.isArray(data)) throw new Error('Invalid data format from /api/pokemon');
        
        cacheRef.current = data;
        if (!mounted) return;
        
        setAllPokemon(data);
        setFilteredPokemon(data);
      } catch (err: any) {
        if (!mounted) return;
        
        setError(err.message || 'Erreur lors du chargement des Pokémon');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredPokemon(allPokemon);
      return;
    }
    const s = debouncedSearchTerm.toLowerCase();
    setFilteredPokemon(allPokemon.filter(p =>
      p.name.toLowerCase().includes(s) || p.number.includes(s)
    ));
  }, [debouncedSearchTerm, allPokemon]);

  return {
    allPokemon,
    filteredPokemon,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    reload: async () => {
      cacheRef.current = null;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchJson('/api/pokemon');
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        cacheRef.current = data;
        setAllPokemon(data);
        setFilteredPokemon(data);
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    }
  };
}