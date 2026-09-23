import React, { useEffect, useMemo, useState } from 'react';
import type { Pokemon, SortOption } from '@/types';
import { usePokemonCards } from '@/hooks/usePokemonCards';
import CardFilters from './CardFilters';
import CardGrid from './CardGrid';
import { rarityRank } from '@/constants/rarities';
import { Filter, Grid3x3, X } from 'lucide-react';

const COLLECTION_ENABLED = true;

// Card numbers can be "001", "TG01", "SV01", "RC02"... Pure integers sort
// numerically and first, codes use a natural string compare so they group.
function compareCardNumbers(a: string, b: string): number {
    const aIsNum = /^\d+$/.test(a);
    const bIsNum = /^\d+$/.test(b);
    if (aIsNum && bIsNum) return Number(a) - Number(b);
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return a.localeCompare(b, undefined, { numeric: true });
}

interface Props {
    pokemon: Pokemon | null;
    onClose: () => void;
}

export default function PokemonModal({ pokemon, onClose }: Props) {
    const { cards, load, isLoading } = usePokemonCards();
    const [cardSearchTerm, setCardSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('rarity');
    const [filterRarity, setFilterRarity] = useState<string>('all');
    const [filterSeries, setFilterSeries] = useState<string>('all');
    const [ownedCards, setOwnedCards] = useState<Record<string, number>>({});
    const [pinnedCardIds, setPinnedCardIds] = useState<Set<string>>(new Set());
    const [pinLoadingIds, setPinLoadingIds] = useState<Set<string>>(new Set());

    // Filters start fresh for every Pokémon (state adjusted during render,
    // which React prefers over resetting it in an effect).
    const [shownPokemonId, setShownPokemonId] = useState(pokemon?.id);
    if (pokemon?.id !== shownPokemonId) {
        setShownPokemonId(pokemon?.id);
        setCardSearchTerm('');
        setFilterRarity('all');
        setFilterSeries('all');
        setSortBy('rarity');
    }

    useEffect(() => {
        if (pokemon) load(pokemon.id);
    }, [pokemon, load]);

    // Escape closes the modal; the page behind must not scroll while it is open.
    useEffect(() => {
        if (!pokemon) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [pokemon, onClose]);

    // Which of these cards the user owns / follows (both endpoints answer
    // harmlessly for anonymous visitors).
    useEffect(() => {
        if (cards.length === 0) return;
        let cancelled = false;

        fetch('/api/collection/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardIds: cards.map(c => c.id) }),
        })
            .then(response => response.json())
            .then(data => { if (!cancelled) setOwnedCards(data.owned || {}); })
            .catch(error => console.error('Error fetching owned cards:', error));

        fetch('/api/dashboard/pins')
            .then(response => (response.ok ? response.json() : null))
            .then(data => {
                if (cancelled || !data) return;
                setPinnedCardIds(new Set<string>((data.pins || []).map((p: { card: { id: string } }) => p.card.id)));
            })
            .catch(error => console.error('Error fetching pinned cards:', error));

        return () => { cancelled = true; };
    }, [cards]);

    const togglePin = async (cardId: string) => {
        const wasPinned = pinnedCardIds.has(cardId);

        // Optimistic update
        setPinnedCardIds(prev => {
            const next = new Set(prev);
            if (wasPinned) next.delete(cardId);
            else next.add(cardId);
            return next;
        });
        setPinLoadingIds(prev => new Set(prev).add(cardId));

        try {
            const response = wasPinned
                ? await fetch(`/api/dashboard/pins?cardId=${encodeURIComponent(cardId)}`, {
                    method: 'DELETE',
                })
                : await fetch('/api/dashboard/pins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cardId }),
                });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            console.error('Error toggling pin:', error);
            // Rollback
            setPinnedCardIds(prev => {
                const next = new Set(prev);
                if (wasPinned) next.add(cardId);
                else next.delete(cardId);
                return next;
            });
        } finally {
            setPinLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(cardId);
                return next;
            });
        }
    };

    const updateOwnedCard = (cardId: string) => {
        setOwnedCards(prev => ({
            ...prev,
            [cardId]: (prev[cardId] || 0) + 1
        }));
    };

    const uniqueRarities = useMemo(
        () => Array.from(new Set(cards.map(c => c.rarity))).filter(Boolean),
        [cards]
    );

    const uniqueSeries = useMemo(
        () => Array.from(new Set(cards.map(c => c.series))).filter(Boolean),
        [cards]
    );

    const cardsWithMultipleRarities = useMemo(() => {
        const grouped = new Map<string, Set<string>>();

        cards.forEach(card => {
            const key = `${card.set}::${card.name}`;
            if (!grouped.has(key)) grouped.set(key, new Set());
            grouped.get(key)!.add(card.rarity);
        });

        const warningIds = new Set<string>();

        grouped.forEach((rarities, key) => {
            if (rarities.size > 1) {
                const [setName, cardName] = key.split('::');
                cards.forEach(c => {
                    if (c.set === setName && c.name === cardName) {
                        warningIds.add(c.id);
                    }
                });
            }
        });

        return warningIds;
    }, [cards]);

    const filteredSorted = useMemo(() => {
        let result = [...cards];

        if (cardSearchTerm.trim()) {
            const searchLower = cardSearchTerm.toLowerCase();
            result = result.filter(c =>
                c.set.toLowerCase().includes(searchLower) ||
                c.series.toLowerCase().includes(searchLower) ||
                c.name.toLowerCase().includes(searchLower)
            );
        }

        if (filterRarity !== 'all') {
            result = result.filter(c => c.rarity === filterRarity);
        }

        if (filterSeries !== 'all') {
            result = result.filter(c => c.series === filterSeries);
        }

        if (sortBy === 'rarity') {
            result.sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity));
        } else if (sortBy === 'price') {
            result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        } else if (sortBy === 'set') {
            result.sort((a, b) => a.set.localeCompare(b.set));
        } else if (sortBy === 'number') {
            result.sort((a, b) => compareCardNumbers(a.number, b.number));
        } else if (sortBy === 'date-asc' || sortBy === 'date-desc') {
            const direction = sortBy === 'date-asc' ? 1 : -1;
            result.sort((a, b) =>
                direction * (Date.parse(a.releaseDate) - Date.parse(b.releaseDate)) ||
                a.set.localeCompare(b.set) ||
                compareCardNumbers(a.number, b.number)
            );
        }

        return result;
    }, [cards, cardSearchTerm, sortBy, filterRarity, filterSeries]);

    if (!pokemon) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-red-500/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative px-4 sm:px-6 py-6 sm:py-12 border-b border-red-500/20 bg-gradient-to-r from-slate-900/95 via-red-900/60 to-slate-900/95 backdrop-blur-xl flex-shrink-0 rounded-t-3xl">

                    <div className="absolute inset-0 opacity-[0.12]" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60V20z' fill='none' stroke='%23ef4444' stroke-width='1.5'/%3E%3C/svg%3E")`,
                        backgroundSize: "70px 70px",
                        maskImage: "linear-gradient(to bottom, transparent, black, black, transparent)"
                    }}></div>

                    <div className="absolute -top-20 -left-28 w-80 h-80 bg-red-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute top-32 right-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex items-center justify-between gap-6">

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-800/50 rounded-2xl p-2 border-2 border-red-500/40 shadow-xl">
                                    <img
                                        src={pokemon.imageUrl}
                                        alt={pokemon.name}
                                        className="w-full h-full object-contain drop-shadow-lg"
                                    />
                                </div>

                                <div>
                                    <h2
                                        id="modal-title"
                                        className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 drop-shadow-lg"
                                    >
                                        {pokemon.name}
                                    </h2>
                                    {!isLoading && (
                                        <p className="text-sm text-red-200/80 mt-1 font-medium">
                                            <strong className="text-white">{cards.length}</strong> cartes disponibles
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Fermer la modal"
                                className="p-3 rounded-xl
                     bg-slate-800/80 hover:bg-red-900/30
                     border-2 border-red-500/30 hover:border-red-400/60
                     text-red-300 hover:text-red-200
                     backdrop-blur-md
                     transition-all duration-200
                     shadow-lg hover:shadow-red-500/30"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                    {!isLoading && cards.length > 0 ? (
                        <>
                            <CardFilters
                                cardSearchTerm={cardSearchTerm}
                                onCardSearchTerm={setCardSearchTerm}
                                sortBy={sortBy}
                                onSortBy={(v: string) => setSortBy(v as SortOption)}
                                filterRarity={filterRarity}
                                onFilterRarity={setFilterRarity}
                                filterSeries={filterSeries}
                                onFilterSeries={setFilterSeries}
                                uniqueRarities={uniqueRarities}
                                uniqueSeries={uniqueSeries}
                                onReset={() => {
                                    setCardSearchTerm('');
                                    setFilterRarity('all');
                                    setFilterSeries('all');
                                    setSortBy('rarity');
                                }}
                            />

                            {filteredSorted.length > 0 ? (
                                <div className="mt-6">
                                    <CardGrid
                                        cards={filteredSorted}
                                        cardsWithMultipleRarities={cardsWithMultipleRarities}
                                        collectionEnabled={COLLECTION_ENABLED}
                                        ownedCards={ownedCards}
                                        onCardAdded={updateOwnedCard}
                                        pinnedCardIds={pinnedCardIds}
                                        pinLoadingIds={pinLoadingIds}
                                        onTogglePin={togglePin}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Filter size={48} className="mx-auto text-red-500/40 mb-4" />
                                    <p className="text-red-200">Aucune carte ne correspond aux filtres</p>
                                    <button
                                        onClick={() => {
                                            setCardSearchTerm('');
                                            setFilterRarity('all');
                                            setFilterSeries('all');
                                            setSortBy('rarity');
                                        }}
                                        className="mt-6 px-6 py-3 
                               bg-gradient-to-r from-red-600 to-orange-600 
                               hover:from-red-500 hover:to-orange-500
                               text-white rounded-xl font-bold
                               shadow-lg hover:shadow-xl hover:shadow-red-500/50
                               transform hover:scale-105
                               transition-all duration-200"
                                    >
                                        🔄 Réinitialiser les filtres
                                    </button>
                                </div>
                            )}
                        </>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin w-12 h-12 border-4 border-red-500/40 border-t-transparent rounded-full"></div>
                            <p className="text-white mt-4">Chargement des cartes...</p>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Grid3x3 size={48} className="mx-auto text-red-500/40 mb-4" />
                            <p className="text-red-200">Aucune carte trouvée pour ce Pokémon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}