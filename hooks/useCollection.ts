import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/app/contexts/ToastContext';

interface CollectionItem {
  id: number;
  quantity: number;
  addedAt: string;
  card: {
    id: string;
    name: string;
    number: string;
    rarity: string;
    image: string;
    smallImage: string;
    set: string;
    series: string;
    price: number | null;
    pokemon: {
      id: number;
      name: string;
    };
  };
}

interface CollectionResponse {
  collections: CollectionItem[];
  total: number;
  page: number;
  totalPages: number;
}

export function useCollection() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addToCollection = useCallback(async (cardId: string) => {
    if (!session?.user) {
      showToast('You must be logged in to add cards', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/collection/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add card');
      }

      showToast('Card added to collection', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Error adding card', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, showToast]);

  const updateQuantity = useCallback(async (cardId: string, quantity: number) => {
    if (!session?.user) {
      showToast('You must be logged in', 'error');
      return false;
    }

    if (quantity < 1) {
      showToast('Quantity must be at least 1', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/collection/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update quantity');
      }

      showToast('Quantity updated', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Error updating quantity', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, showToast]);

  const removeFromCollection = useCallback(async (cardId: string) => {
    if (!session?.user) {
      showToast('You must be logged in', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/collection/remove?cardId=${cardId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove card');
      }

      showToast('Card removed from collection', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Error removing card', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, showToast]);

  const fetchCollection = useCallback(async (page = 1, limit = 50): Promise<CollectionResponse | null> => {
    if (!session?.user) {
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/collection?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch collection');
      }

      return data;
    } catch (error: any) {
      showToast(error.message || 'Error fetching collection', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, showToast]);

  return {
    addToCollection,
    updateQuantity,
    removeFromCollection,
    fetchCollection,
    isLoading,
    isAuthenticated: !!session?.user,
  };
}