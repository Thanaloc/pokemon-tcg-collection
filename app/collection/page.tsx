'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import CollectionHeader from '@/components/Collection/CollectionHeader';
import CollectionFilters from '@/components/Collection/CollectionFilters';
import CollectionCard from '@/components/Collection/CollectionCard';
import CollectionGroup from '@/components/Collection/CollectionGroup';
import CollectionEmpty from '@/components/Collection/CollectionEmpty';

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

export default function CollectionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { fetchCollection, updateQuantity, removeFromCollection, isLoading } = useCollection();
  
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, totalValue: 0 });
  const [sortBy, setSortBy] = useState<'set' | 'pokemon' | 'price' | 'quantity'>('set');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    loadCollection();
  }, [session, page]);

  const loadCollection = async () => {
    const data = await fetchCollection(page, 50);
    if (data) {
      setCollections(data.collections);
      setTotalPages(data.totalPages);
      setStats({
        total: data.total,
        totalValue: stats.totalValue,
      });
      
      if (page === 1 || stats.totalValue === 0) {
        calculateTotalValue();
      }
    }
  };

  const calculateTotalValue = async () => {
    const allData = await fetchCollection(1, 1000);
    if (allData) {
      const totalValue = allData.collections.reduce((sum: number, item: CollectionItem) => {
        return sum + (item.card.price || 0) * item.quantity;
      }, 0);
      setStats(prev => ({ ...prev, totalValue }));
    }
  };

  const handleUpdateQuantity = async (cardId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    
    const success = await updateQuantity(cardId, newQuantity);
    if (success) loadCollection();
  };

  const handleRemove = async (cardId: string) => {
    if (!confirm('Retirer cette carte de votre collection ?')) return;
    const success = await removeFromCollection(cardId);
    if (success) loadCollection();
  };

  if (!session?.user) return null;

  // Filter and sort
  const sortedAndFiltered = collections
    .filter(item => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        item.card.pokemon.name.toLowerCase().includes(search) ||
        item.card.set.toLowerCase().includes(search) ||
        item.card.series.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'set':
          return a.card.set.localeCompare(b.card.set);
        case 'pokemon':
          return a.card.pokemon.name.localeCompare(b.card.pokemon.name);
        case 'price':
          return (b.card.price || 0) - (a.card.price || 0);
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

  // Group by set or pokemon
  const groupedData = (sortBy === 'set' || sortBy === 'pokemon')
    ? sortedAndFiltered.reduce((acc, item) => {
        const key = sortBy === 'set' ? item.card.set : item.card.pokemon.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, CollectionItem[]>)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      <CollectionHeader
        userName={session.user.name || ''}
        userEmail={session.user.email || ''}
        totalCards={stats.total}
        totalValue={stats.totalValue}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <CollectionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-red-500/40 border-t-transparent rounded-full"></div>
            <p className="text-white mt-4">Chargement de la collection...</p>
          </div>
        ) : collections.length === 0 ? (
          <CollectionEmpty />
        ) : groupedData ? (
          <div className="space-y-8">
            {Object.entries(groupedData).map(([groupName, items]) => (
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
            {sortedAndFiltered.map((item) => (
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

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
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
              disabled={page === totalPages}
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