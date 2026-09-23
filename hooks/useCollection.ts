import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/app/contexts/ToastContext';
import type { CollectionResponse, CollectionSort } from '@/types';

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue');
  return data;
}

export function useCollection() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addToCollection = useCallback(async (cardId: string) => {
    if (!session?.user) {
      showToast('Connectez-vous pour ajouter des cartes', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      await request('/api/collection/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      });
      showToast('Carte ajoutée à la collection', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur lors de l'ajout", 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, showToast]);

  const updateQuantity = useCallback(async (cardId: string, quantity: number) => {
    try {
      await request('/api/collection/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, quantity }),
      });
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de la mise à jour', 'error');
      return false;
    }
  }, [showToast]);

  const removeFromCollection = useCallback(async (cardId: string) => {
    try {
      await request(`/api/collection/remove?cardId=${encodeURIComponent(cardId)}`, { method: 'DELETE' });
      showToast('Carte retirée de la collection', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du retrait', 'error');
      return false;
    }
  }, [showToast]);

  const fetchCollection = useCallback(async (
    params: { page: number; limit?: number; q?: string; sort?: CollectionSort },
    signal?: AbortSignal,
  ): Promise<CollectionResponse | null> => {
    const search = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit ?? 50),
      sort: params.sort ?? 'set',
    });
    if (params.q) search.set('q', params.q);

    try {
      return await request(`/api/collection?${search}`, { signal });
    } catch (error) {
      if (signal?.aborted) return null;
      showToast(error instanceof Error ? error.message : 'Erreur de chargement', 'error');
      return null;
    }
  }, [showToast]);

  return {
    addToCollection,
    updateQuantity,
    removeFromCollection,
    fetchCollection,
    isLoading,
    isAuthenticated: !!session?.user,
  };
}
