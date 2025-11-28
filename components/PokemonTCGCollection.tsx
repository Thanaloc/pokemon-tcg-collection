'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Grid3x3, X, Loader2, Filter, SortAsc, Award, AlertTriangle } from 'lucide-react';

// Feature flag - à activer plus tard
const COLLECTION_ENABLED = false;

// Types TypeScript
interface Pokemon {
  id: number;
  name: string;
  number: string;
  types: string[];
  imageUrl: string;
}

interface Card {
  id: string;
  name: string;
  set: string;
  rarity: string;
  image: string;
  smallImage: string;
  number: string;
  series: string;
  price: number | null;
  cardmarketUrl: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  'Grass': 'bg-green-500 text-white',
  'Fire': 'bg-red-500 text-white',
  'Water': 'bg-blue-500 text-white',
  'Lightning': 'bg-yellow-400 text-gray-900',
  'Psychic': 'bg-purple-500 text-white',
  'Fighting': 'bg-orange-500 text-white',
  'Colorless': 'bg-gray-400 text-white',
  'Darkness': 'bg-slate-800 text-white',
  'Metal': 'bg-gray-500 text-white',
  'Fairy': 'bg-pink-500 text-white',
  'Dragon': 'bg-indigo-600 text-white',
};

const RARITY_COLORS: Record<string, string> = {
  'Sans Rareté': 'bg-gray-200 text-black',
  'Commune': 'bg-gray-500 text-white',
  'Peu Commune': 'bg-green-600 text-white',
  'Rare': 'bg-blue-600 text-white',
  'Ultra Rare': 'bg-purple-600 text-white',
  'Double rare': 'bg-pink-600 text-white',
  'Secrète': 'bg-amber-500 text-white',
  'Illustration rare': 'bg-yellow-400 text-black',
  'Illustration spéciale rare': 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white',
  'Magnifique rare': 'bg-gradient-to-r from-red-400 via-orange-400 via-yellow-400 via-green-400 via-blue-500 via-indigo-500 to-purple-600 text-white',
  'Hyper rare': 'bg-red-600 text-white',
  'Promo': 'bg-teal-500 text-white',
  'Rainbow Rare': 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 text-white',
  'Holo Rare': 'bg-blue-400 text-white',
  'Rare Holo': 'bg-blue-400 text-white',
  'Radieux Rare': 'bg-yellow-300 text-black',
  'Holo Rare V': 'bg-purple-400 text-white',
  'Shiny Rare': 'bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 text-black',
  'Shiny rare VMAX': 'bg-gradient-to-r from-gray-100 via-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 text-white',
  'Holo Rare VSTAR': 'bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-600 text-white',
  'Holo Rare VMAX': 'bg-gradient-to-r from-blue-400 via-red-500 to-indigo-600 text-white',
  'Méga Hyper Rare': 'bg-yellow-600 text-white',
  'Rare Noir Blanc': 'bg-gradient-to-r from-black to-white text-white',
  'Chromatique ultra rare': 'bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 text-white'
};

export default function PokemonTCGCollection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [selectedPokemonCards, setSelectedPokemonCards] = useState<Card[]>([]);
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres et tri
  const [cardSearchTerm, setCardSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'set' | 'rarity' | 'number' | 'price'>('set');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterSeries, setFilterSeries] = useState<string>('all');

  // Charger tous les Pokémon au démarrage
  useEffect(() => {
    loadAllPokemon();
  }, []);

  // Filtrer les Pokémon selon la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPokemon(allPokemon);
    } else {
      const filtered = allPokemon.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.number.includes(searchTerm)
      );
      setFilteredPokemon(filtered);
    }
  }, [searchTerm, allPokemon]);

  // Charger les cartes quand on sélectionne un Pokémon
  useEffect(() => {
    if (selectedPokemon) {
      loadPokemonCards(selectedPokemon.name);
      setCardSearchTerm('');
      setFilterRarity('all');
      setFilterSeries('all');
      setSortBy('set');
    }
  }, [selectedPokemon]);

  async function loadAllPokemon() {
    setIsLoadingPokemon(true);
    setError(null);
    try {
      const response = await fetch('/api/pokemon');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur API');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllPokemon(data);
        setFilteredPokemon(data);
      } else {
        throw new Error('Format invalide');
      }
    } catch (error: any) {
      console.error('Erreur chargement Pokémon:', error);
      setError('Impossible de charger les Pokémon: ' + error.message);
    } finally {
      setIsLoadingPokemon(false);
    }
  }

  async function loadPokemonCards(pokemonName: string) {
    setIsLoadingCards(true);
    try {
      const response = await fetch(`/api/cards?pokemon=${encodeURIComponent(pokemonName)}`);
      const data = await response.json();
      setSelectedPokemonCards(data);
    } catch (error) {
      console.error('Erreur chargement cartes:', error);
      setSelectedPokemonCards([]);
    } finally {
      setIsLoadingCards(false);
    }
  }

  // Détecter les cartes avec plusieurs raretés dans la même série
  const cardsWithMultipleRarities = useMemo(() => {
    const cardsBySetAndName = new Map<string, Set<string>>();
    
    selectedPokemonCards.forEach(card => {
      const key = `${card.set}|||${card.name}`;
      if (!cardsBySetAndName.has(key)) {
        cardsBySetAndName.set(key, new Set());
      }
      cardsBySetAndName.get(key)!.add(card.rarity);
    });
    
    const problematicCards = new Set<string>();
    cardsBySetAndName.forEach((rarities, key) => {
      if (rarities.size > 1) {
        const [set, name] = key.split('|||');
        selectedPokemonCards.forEach(card => {
          if (card.set === set && card.name === name) {
            problematicCards.add(card.id);
          }
        });
      }
    });
    
    return problematicCards;
  }, [selectedPokemonCards]);

  // Filtrer et trier les cartes
  const filteredAndSortedCards = useMemo(() => {
    let cards = [...selectedPokemonCards];

    if (cardSearchTerm.trim()) {
      cards = cards.filter(card =>
        card.set.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
        card.series.toLowerCase().includes(cardSearchTerm.toLowerCase())
      );
    }

    if (filterRarity !== 'all') {
      cards = cards.filter(card => card.rarity === filterRarity);
    }

    if (filterSeries !== 'all') {
      cards = cards.filter(card => card.series === filterSeries);
    }

    cards.sort((a, b) => {
      switch (sortBy) {
        case 'set':
          return a.set.localeCompare(b.set);
        case 'rarity':
          const rarityOrder = ['Sans Rareté','Commune', 'Peu Commune', 'Rare', 'Rare Holo', 'Holo Rare', 'Double rare', 'Ultra Rare', 'Holo Rare V', 'Holo Rare VMAX', 'Holo Rare VSTAR', 'Radieux Rare', 'Illustration rare', 'Shiny Rare', 'Rainbow Rare', 'Secrète', 'Hyper rare', 'Magnifique rare', 'Illustration spéciale rare', 'Shiny Rare VMAX', 'Chromatique ultra rare', 'Méga Hyper Rare', 'Rare Noir Blanc'];
          return rarityOrder.reverse().indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        case 'number':
          return parseInt(a.number) - parseInt(b.number);
        case 'price':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    return cards;
  }, [selectedPokemonCards, cardSearchTerm, filterRarity, filterSeries, sortBy]);

  const uniqueRarities = useMemo(() => {
    return [...new Set(selectedPokemonCards.map(c => c.rarity))].filter(Boolean);
  }, [selectedPokemonCards]);

  const uniqueSeries = useMemo(() => {
    return [...new Set(selectedPokemonCards.map(c => c.series))].filter(Boolean);
  }, [selectedPokemonCards]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      {/* Header moderne */}
      <header className="bg-gradient-to-r from-slate-900 via-red-900 to-slate-900 shadow-2xl sticky top-0 z-50 border-b border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 drop-shadow-2xl">
                Pokémon TCG
              </h1>
              <p className="text-red-200/80 text-sm mt-2 font-medium">Collection complète de cartes</p>
            </div>

            {!isLoadingPokemon && (
              <div className="flex gap-4">
                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-red-400/30 shadow-2xl">
                  <p className="text-xs text-red-200 font-bold uppercase tracking-wider">Pokémon</p>
                  <p className="text-3xl font-black text-white">{allPokemon.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-orange-400/30 shadow-2xl">
                  <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Cartes</p>
                  <p className="text-3xl font-black text-white">25K+</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400" size={22} />
            <input
              type="text"
              placeholder="Rechercher un Pokémon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border-2 border-red-500/30 rounded-2xl focus:ring-4 focus:ring-red-500/50 focus:border-red-400 transition-all shadow-2xl text-white placeholder-red-300/50 text-lg backdrop-blur-xl"
            />
          </div>

          {!isLoadingPokemon && (
            <p className="text-sm text-red-200/70 mt-3 font-medium">
              ⚡ {filteredPokemon.length} résultats
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <p className="text-red-200 font-semibold text-lg">{error}</p>
            <button onClick={loadAllPokemon} className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition shadow-lg font-bold">
              Réessayer
            </button>
          </div>
        ) : isLoadingPokemon ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/20">
            <Loader2 className="animate-spin text-red-500 mb-6" size={56} />
            <p className="text-white font-bold text-xl">Chargement du Pokédex...</p>
            <p className="text-sm text-red-300/70 mt-3">(~2 minutes la première fois)</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
              {filteredPokemon.map((pokemon) => (
                <div
                  key={`${pokemon.id}-${pokemon.name}`}
                  onClick={() => setSelectedPokemon(pokemon)}
                  className="relative rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105 p-4 border border-red-500/20 hover:border-red-400/60 group overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="w-full h-32 object-contain mb-3 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 relative z-10"
                    loading="lazy"
                  />
                  <div className="text-center relative z-10">
                    <p className="text-xs text-red-300 font-mono bg-slate-900/60 inline-block px-3 py-1 rounded-full mb-2 border border-red-500/30">#{pokemon.number}</p>
                    <h3 className="font-bold text-white text-base mb-2">{pokemon.name}</h3>
                    <div className="flex gap-1 justify-center flex-wrap">
                      {pokemon.types.slice(0, 2).map((type, idx) => (
                        <span key={idx} className={`text-xs px-2 py-1 rounded-lg font-semibold shadow-lg ${TYPE_COLORS[type] || 'bg-gray-100'}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPokemon.length === 0 && (
              <div className="text-center py-16 bg-slate-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/20">
                <p className="text-red-200 text-lg font-medium">Aucun Pokémon trouvé</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal modernisée */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setSelectedPokemon(null)}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-red-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-slate-900 via-red-900 to-slate-900 px-6 py-5 rounded-t-3xl flex-shrink-0 border-b border-red-500/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    {selectedPokemon.name}
                  </h2>
                  {!isLoadingCards && (
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2 text-red-200">
                        <Award size={18} />
                        <span className="text-sm font-medium">
                          <strong className="text-white">{selectedPokemonCards.length}</strong> cartes
                        </span>
                      </div>
                      {filteredAndSortedCards.length !== selectedPokemonCards.length && (
                        <span className="text-sm text-red-300/70">
                          ({filteredAndSortedCards.length} affichées)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedPokemon(null)} className="p-2 hover:bg-red-500/20 rounded-full transition text-red-400 hover:text-red-300">
                  <X size={28} />
                </button>
              </div>

              {!isLoadingCards && selectedPokemonCards.length > 0 && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher par set ou série..."
                      value={cardSearchTerm}
                      onChange={(e) => setCardSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-red-500/30 rounded-xl focus:ring-2 focus:ring-red-500/50 bg-slate-800/50 text-white placeholder-red-300/50 backdrop-blur-xl"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <SortAsc size={16} className="text-red-400" />
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="text-sm border border-red-500/30 rounded-xl px-3 py-2 bg-slate-800/50 text-white backdrop-blur-xl">
                        <option value="set">Par Set</option>
                        <option value="rarity">Par Rareté</option>
                        <option value="number">Par Numéro</option>
                        <option value="price">Par Prix</option>
                      </select>
                    </div>

                    {uniqueRarities.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-red-400" />
                        <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="text-sm border border-red-500/30 rounded-xl px-3 py-2 bg-slate-800/50 text-white backdrop-blur-xl">
                          <option value="all">Toutes raretés</option>
                          {uniqueRarities.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    )}

                    {uniqueSeries.length > 1 && (
                      <select value={filterSeries} onChange={(e) => setFilterSeries(e.target.value)} className="text-sm border border-red-500/30 rounded-xl px-3 py-2 bg-slate-800/50 text-white backdrop-blur-xl">
                        <option value="all">Toutes séries</option>
                        {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}

                    {(cardSearchTerm || filterRarity !== 'all' || filterSeries !== 'all') && (
                      <button onClick={() => { setCardSearchTerm(''); setFilterRarity('all'); setFilterSeries('all'); }} className="text-sm text-red-300 hover:text-red-200 font-medium bg-red-500/20 px-3 py-2 rounded-xl border border-red-500/30">
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingCards ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="animate-spin text-red-500 mb-6" size={56} />
                  <p className="text-white font-bold text-xl">Chargement des cartes...</p>
                </div>
              ) : filteredAndSortedCards.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAndSortedCards.map((card) => {
                    const hasPriceWarning = cardsWithMultipleRarities.has(card.id);
                    
                    return (
                      <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 hover:shadow-2xl hover:shadow-red-500/30 hover:scale-105 transition-all duration-300 border border-red-500/20 hover:border-red-400/50 relative group">
                        {card.price && (
                          <div className={`absolute top-2 right-2 ${hasPriceWarning ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xl z-10 flex items-center gap-1`}>
                            {hasPriceWarning && <AlertTriangle size={12} />}
                            {card.price.toFixed(2)}€
                          </div>
                        )}
                        
                        <img src={card.smallImage} alt={card.name} className="w-full rounded-xl shadow-lg mb-3 group-hover:shadow-red-500/50 transition-shadow border border-red-500/20" loading="lazy" />
                        
                        <div className="text-sm space-y-2">
                          <p className="font-bold text-white truncate text-center">{card.set}</p>
                          <div className="flex justify-center">
                            <span className={`inline-block text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg ${RARITY_COLORS[card.rarity] || 'bg-gray-100'}`}>
                              {card.rarity}
                            </span>
                          </div>
                          <div className="flex items-center justify-center text-xs text-red-300/70 font-mono">
                            <span>#{card.number}</span>
                          </div>
                        </div>
                        
                        {hasPriceWarning && card.price && (
                          <div className="mt-2 bg-orange-500/20 border border-orange-500/40 rounded-lg p-2 flex items-start gap-2">
                            <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-200 leading-tight">
                              Prix possiblement erroné (plusieurs versions)
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-3 space-y-2">
                          {card.cardmarketUrl && (
                            <a href={card.cardmarketUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 text-xs bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition text-center font-bold shadow-lg hover:shadow-red-500/50">
                              📊 Cardmarket
                            </a>
                          )}
                          <button disabled={!COLLECTION_ENABLED} title={!COLLECTION_ENABLED ? "Bientôt disponible" : ""} className={`w-full py-2.5 text-xs rounded-xl transition font-bold ${COLLECTION_ENABLED ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 cursor-pointer shadow-lg' : 'bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-50 border border-slate-700/50'}`}>
                            ⭐ Ma collection
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selectedPokemonCards.length > 0 ? (
                <div className="text-center py-16 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-red-500/20">
                  <Filter size={48} className="mx-auto text-red-500/50 mb-4" />
                  <p className="text-red-200">Aucune carte ne correspond aux filtres</p>
                  <button onClick={() => { setCardSearchTerm(''); setFilterRarity('all'); setFilterSeries('all'); }} className="mt-4 text-red-400 hover:text-red-300 font-bold">
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-red-500/20">
                  <Grid3x3 size={48} className="mx-auto text-red-500/50 mb-4" />
                  <p className="text-red-200">Aucune carte trouvée pour ce Pokémon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}