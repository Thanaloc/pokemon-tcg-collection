import React, { useEffect, useMemo, useState } from 'react';
import type { Pokemon, SortOption } from '@/types';
import { usePokemonCards } from '@/hooks/usePokemonCards';
import CardFilters from './CardFilters';
import CardGrid from './CardGrid';
import { rarityRank } from '@/constants/rarities';
import { X } from 'lucide-react';
import { typeColor } from '@/constants/types';
import TypeBadge from '@/components/ui/TypeBadge';

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

    const resetFilters = () => {
        setCardSearchTerm('');
        setFilterRarity('all');
        setFilterSeries('all');
        setSortBy('rarity');
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-slate-950 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-slate-800 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-slate-800"
                    style={{ backgroundImage: `linear-gradient(100deg, ${typeColor(pokemon.types[0])}40, transparent 60%)` }}
                >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element -- PokeAPI artwork */}
                        <img src={pokemon.imageUrl} alt="" className="w-16 h-16 sm:w-20 sm:h-20 -my-2 object-contain shrink-0 drop-shadow-lg" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400 tabular-nums">#{pokemon.number}</p>
                            <h2 id="modal-title" className="text-2xl font-bold text-white truncate">{pokemon.name}</h2>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {pokemon.types.map(type => <TypeBadge key={type} type={type} />)}
                                {!isLoading && (
                                    <span className="text-xs text-slate-400 ml-1">
                                        {cards.length} carte{cards.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
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
                                onReset={resetFilters}
                            />

                            {filteredSorted.length > 0 ? (
                                <div className="mt-5">
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
                                    <p className="text-slate-400">Aucune carte ne correspond aux filtres.</p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            )}
                        </>
                    ) : isLoading ? (
                        <div className="flex justify-center py-24">
                            <div className="animate-spin w-8 h-8 border-2 border-slate-700 border-t-red-500 rounded-full" aria-label="Chargement des cartes"></div>
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-16">Aucune carte trouvée pour ce Pokémon.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
