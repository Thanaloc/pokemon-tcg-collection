import React, { useEffect, useMemo, useState } from 'react';
import type { Pokemon, Card, SortOption } from '@/types';
import { usePokemonCards } from '@/hooks/usePokemonCards';
import CardFilters from './CardFilters';
import CardGrid from './CardGrid';
import { RARITY_ORDER } from '@/constants/rarityOrder';
import { Filter, Grid3x3, X } from 'lucide-react';

const COLLECTION_ENABLED = false;

interface Props {
    pokemon: Pokemon | null;
    onClose: () => void;
}

export default function PokemonModal({ pokemon, onClose }: Props) {
    const { cards, load, isLoading } = usePokemonCards();
    const [cardSearchTerm, setCardSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('set');
    const [filterRarity, setFilterRarity] = useState<string>('all');
    const [filterSeries, setFilterSeries] = useState<string>('all');

    useEffect(() => {
        if (pokemon) {
            load(pokemon.name);
            setCardSearchTerm('');
            setFilterRarity('all');
            setFilterSeries('all');
            setSortBy('set');
        }
    }, [pokemon, load]);

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
        let list = [...cards];

        if (cardSearchTerm.trim()) {
            const s = cardSearchTerm.toLowerCase();
            list = list.filter(c =>
                c.set.toLowerCase().includes(s) ||
                c.series.toLowerCase().includes(s)
            );
        }
        if (filterRarity !== 'all') {
            list = list.filter(c => c.rarity === filterRarity);
        }
        if (filterSeries !== 'all') {
            list = list.filter(c => c.series === filterSeries);
        }

        list.sort((a, b) => {
            switch (sortBy) {
                case 'set':
                    return a.set.localeCompare(b.set);
                case 'rarity': {
                    const scoreA = RARITY_ORDER.indexOf(a.rarity);
                    const scoreB = RARITY_ORDER.indexOf(b.rarity);
                    return scoreA - scoreB;
                }
                case 'number':
                    return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
                case 'price':
                    return (b.price || 0) - (a.price || 0);
                default:
                    return 0;
            }
        });

        return list;
    }, [cards, cardSearchTerm, filterRarity, filterSeries, sortBy]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!pokemon) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-red-500/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative px-6 py-12 border-b border-red-500/20 bg-gradient-to-r from-slate-900/95 via-red-900/60 to-slate-900/95 backdrop-blur-xl flex-shrink-0 rounded-t-3xl">

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
                                <div className="w-20 h-20 flex-shrink-0 bg-slate-800/50 rounded-2xl p-2 border-2 border-red-500/40 shadow-xl">
                                    <img
                                        src={pokemon.imageUrl}
                                        alt={pokemon.name}
                                        className="w-full h-full object-contain drop-shadow-lg"
                                    />
                                </div>

                                <div>
                                    <h2
                                        id="modal-title"
                                        className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 drop-shadow-lg"
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

                            {/* Bouton fermer */}
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

                <div className="p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
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
                                    setSortBy('set');
                                }}
                            />

                            {filteredSorted.length > 0 ? (
                                <div className="mt-6">
                                    <CardGrid
                                        cards={filteredSorted}
                                        cardsWithMultipleRarities={cardsWithMultipleRarities}
                                        collectionEnabled={COLLECTION_ENABLED}
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
                                            setSortBy('set');
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