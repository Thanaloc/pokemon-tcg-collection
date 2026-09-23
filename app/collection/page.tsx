'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCollection } from '@/hooks/useCollection';
import { useDebounce } from '@/hooks/useDebounce';
import CollectionHeader from '@/components/Collection/CollectionHeader';
import CollectionFilters from '@/components/Collection/CollectionFilters';
import CollectionCard from '@/components/Collection/CollectionCard';
import CollectionGroup from '@/components/Collection/CollectionGroup';
import CollectionEmpty from '@/components/Collection/CollectionEmpty';
import type { CollectionItem, CollectionSort, CollectionStats } from '@/types';

const PAGE_SIZE = 50;

export default function CollectionPage() {
  // The proxy only lets authenticated users reach this page.
  const { data: session } = useSession();
  const { fetchCollection, updateQuantity, removeFromCollection } = useCollection();

  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<CollectionStats>({ distinctCards: 0, totalCopies: 0, totalValue: 0 });
  const [sortBy, setSortBy] = useState<CollectionSort>('set');
  const [searchTerm, setSearchTerm] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const debouncedSearch = useDebounce(searchTerm.trim(), 300);

  // Loading state is derived: we are fetching until the response for the
  // current parameters has arrived.
  const requestKey = `${page}|${sortBy}|${reloadKey}|${debouncedSearch}`;
  const isFetching = loadedKey !== requestKey;
  const hasLoaded = loadedKey !== null && !loadFailed;

  useEffect(() => {
    const controller = new AbortController();
    fetchCollection({ page, limit: PAGE_SIZE, q: debouncedSearch, sort: sortBy }, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        if (data) {
          setCollections(data.collections);
          setTotalPages(data.totalPages);
          setStats(data.stats);
        }
        setLoadFailed(!data);
        setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [fetchCollection, page, debouncedSearch, sortBy, requestKey]);

  const changeSort = (value: CollectionSort) => {
    setSortBy(value);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  // Optimistic: the UI changes right away and rolls back if the API refuses.
  const handleUpdateQuantity = async (cardId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    const item = collections.find(i => i.card.id === cardId);
    const applyDelta = (d: number) => {
      setCollections(prev => prev.map(i => (i.card.id === cardId ? { ...i, quantity: i.quantity + d } : i)));
      setStats(prev => ({
        ...prev,
        totalCopies: prev.totalCopies + d,
        totalValue: prev.totalValue + d * (item?.card.price ?? 0),
      }));
    };

    applyDelta(delta);
    if (!(await updateQuantity(cardId, newQuantity))) applyDelta(-delta);
  };

  const handleRemove = async (cardId: string) => {
    if (!confirm('Retirer cette carte de votre collection ?')) return;
    const item = collections.find(i => i.card.id === cardId);
    if (!item) return;

    setCollections(prev => prev.filter(i => i.card.id !== cardId));
    setStats(prev => ({
      distinctCards: prev.distinctCards - 1,
      totalCopies: prev.totalCopies - item.quantity,
      totalValue: prev.totalValue - item.quantity * (item.card.price ?? 0),
    }));

    if (!(await removeFromCollection(cardId))) {
      setReloadKey(k => k + 1);
    } else if (collections.length === 1 && page > 1) {
      setPage(p => p - 1);
    } else if (page < totalPages) {
      // Pull the first card of the next page into this one.
      setReloadKey(k => k + 1);
    }
  };

  // Server order is kept inside groups (sets newest first, Pokédex order...).
  const groupedData = sortBy === 'set' || sortBy === 'pokemon'
    ? collections.reduce((groups, item) => {
        const key = sortBy === 'set' ? item.card.set : item.card.pokemon.name;
        const group = groups.get(key) ?? [];
        group.push(item);
        groups.set(key, group);
        return groups;
      }, new Map<string, CollectionItem[]>())
    : null;

  const isEmptyCollection = hasLoaded && stats.distinctCards === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      <CollectionHeader
        userName={session?.user?.name || ''}
        userEmail={session?.user?.email || ''}
        distinctCards={stats.distinctCards}
        totalCopies={stats.totalCopies}
        totalValue={stats.totalValue}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <CollectionFilters
          searchTerm={searchTerm}
          onSearchChange={changeSearch}
          sortBy={sortBy}
          onSortChange={changeSort}
        />

        {loadFailed ? (
          <div className="bg-red-900/30 border-2 border-red-500/40 rounded-2xl p-8 text-center">
            <p className="text-red-200 font-semibold text-lg">Impossible de charger la collection.</p>
            <button
              onClick={() => setReloadKey(k => k + 1)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition"
            >
              Réessayer
            </button>
          </div>
        ) : !hasLoaded ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-red-500/40 border-t-transparent rounded-full"></div>
            <p className="text-white mt-4">Chargement de la collection...</p>
          </div>
        ) : isEmptyCollection ? (
          <CollectionEmpty />
        ) : collections.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-red-500/10">
            <p className="text-red-200 text-lg font-medium">Aucune carte ne correspond à « {debouncedSearch} »</p>
          </div>
        ) : (
          <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            {groupedData ? (
              <div className="space-y-8">
                {[...groupedData.entries()].map(([groupName, items]) => (
                  <CollectionGroup
                    key={groupName}
                    groupName={groupName}
                    items={items}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {collections.map((item) => (
                  <CollectionCard
                    key={item.id}
                    card={item.card}
                    quantity={item.quantity}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800
                       disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Précédent
            </button>
            <span className="px-4 py-2 bg-slate-800 text-white rounded-lg">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800
                       disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
