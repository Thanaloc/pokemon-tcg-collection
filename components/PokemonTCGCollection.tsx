'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Grid3x3, X, Loader2, Filter, SortAsc, Award } from 'lucide-react';

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
          const rarityOrder = ['Commune', 'Peu Commune', 'Rare', 'Rare Holo', 'Holo Rare', 'Double rare', 'Ultra Rare', 'Holo Rare V', 'Holo Rare VMAX', 'Holo Rare VSTAR', 'Radieux Rare', 'Illustration rare', 'Shiny Rare', 'Rainbow Rare', 'Secrète', 'Hyper rare', 'Magnifique rare', 'Illustration spéciale rare', 'Shiny Rare VMAX', 'Chromatique ultra rare', 'Méga Hyper Rare', 'Rare Noir Blanc'];
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
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-slate-300 to-gray-400">
      {/* Header Pokédex style */}
      <header className="bg-gradient-to-r from-red-600 via-red-700 to-slate-900 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
                ⚡ Pokémon TCG Collection
              </h1>
              <p className="text-red-100 text-sm mt-1">Explorez toutes les cartes du jeu de cartes à collectionner</p>
            </div>

            {!isLoadingPokemon && (
              <div className="flex gap-3">
                <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg">
                  <p className="text-xs text-red-100 font-semibold uppercase tracking-wide">Pokémon</p>
                  <p className="text-3xl font-black text-white">{allPokemon.length}</p>
                </div>
                <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg">
                  <p className="text-xs text-red-100 font-semibold uppercase tracking-wide">Cartes</p>
                  <p className="text-3xl font-black text-white">25K+</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={22} />
            <input
              type="text"
              placeholder="🔍 Rechercher un Pokémon par nom ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-red-300 focus:border-red-400 transition-all shadow-xl text-gray-800 placeholder-gray-500 text-lg"
            />
          </div>

          {!isLoadingPokemon && (
            <p className="text-sm text-red-100 mt-3 font-medium">
              ✨ {filteredPokemon.length} Pokémon trouvés
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-6 text-center shadow-lg">
            <p className="text-red-700 font-semibold">{error}</p>
            <button onClick={loadAllPokemon} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md">
              Réessayer
            </button>
          </div>
        ) : isLoadingPokemon ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl">
            <Loader2 className="animate-spin text-red-500 mb-4" size={48} />
            <p className="text-gray-700 font-medium">Chargement du Pokédex...</p>
            <p className="text-sm text-gray-500 mt-2">(~2 minutes la première fois)</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {filteredPokemon.map((pokemon) => (
                <div
                  key={`${pokemon.id}-${pokemon.name}`}
                  onClick={() => setSelectedPokemon(pokemon)}
                  className="relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-110 hover:-rotate-1 p-5 border-2 border-gray-300 hover:border-red-500 group overflow-hidden"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0.95) 25%, rgba(255, 255, 255, 0.98) 50%, rgba(15, 23, 42, 0.08) 100%)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  {/* Effet Pokéball subtil */}
                  <div className="absolute top-2 right-2 w-16 h-16 rounded-full opacity-5 pointer-events-none" style={{
                    background: 'linear-gradient(180deg, #ef4444 0%, #ef4444 45%, #1e293b 45%, #1e293b 55%, white 55%, white 100%)',
                    border: '2px solid rgba(0,0,0,0.1)'
                  }}></div>
                  
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="w-full h-36 object-contain mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="text-center relative">
                    <p className="text-xs text-gray-600 font-mono bg-gray-100 inline-block px-2 py-1 rounded-full mb-1">#{pokemon.number}</p>
                    <h3 className="font-bold text-gray-800 text-lg">{pokemon.name}</h3>
                    <div className="flex gap-1 justify-center mt-3 flex-wrap">
                      {pokemon.types.slice(0, 2).map((type, idx) => (
                        <span key={idx} className={`text-xs px-3 py-1 rounded-full font-semibold shadow-md ${TYPE_COLORS[type] || 'bg-gray-100'}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPokemon.length === 0 && (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl">
                <p className="text-gray-700 text-lg font-medium">Aucun Pokémon trouvé</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4" onClick={() => setSelectedPokemon(null)}>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-slate-900 px-6 py-5 rounded-t-3xl flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-3xl font-black text-white drop-shadow-lg">
                    {selectedPokemon.name}
                  </h2>
                  {!isLoadingCards && (
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2 text-white">
                        <Award size={18} />
                        <span className="text-sm font-medium">
                          <strong>{selectedPokemonCards.length}</strong> cartes
                        </span>
                      </div>
                      {filteredAndSortedCards.length !== selectedPokemonCards.length && (
                        <span className="text-sm text-red-100">
                          ({filteredAndSortedCards.length} affichées)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedPokemon(null)} className="p-2 hover:bg-white/20 rounded-full transition text-white">
                  <X size={28} />
                </button>
              </div>

              {!isLoadingCards && selectedPokemonCards.length > 0 && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher par set ou série..."
                      value={cardSearchTerm}
                      onChange={(e) => setCardSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-white bg-white text-gray-800 placeholder-gray-600"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <SortAsc size={16} className="text-white" />
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="text-sm border border-white/50 rounded-lg px-3 py-1.5 bg-white text-gray-800">
                        <option value="set">Par Set</option>
                        <option value="rarity">Par Rareté</option>
                        <option value="number">Par Numéro</option>
                        <option value="price">Par Prix</option>
                      </select>
                    </div>

                    {uniqueRarities.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-white" />
                        <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="text-sm border border-white/50 rounded-lg px-3 py-1.5 bg-white text-gray-800">
                          <option value="all">Toutes raretés</option>
                          {uniqueRarities.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    )}

                    {uniqueSeries.length > 1 && (
                      <select value={filterSeries} onChange={(e) => setFilterSeries(e.target.value)} className="text-sm border border-white/50 rounded-lg px-3 py-1.5 bg-white text-gray-800">
                        <option value="all">Toutes séries</option>
                        {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}

                    {(cardSearchTerm || filterRarity !== 'all' || filterSeries !== 'all') && (
                      <button onClick={() => { setCardSearchTerm(''); setFilterRarity('all'); setFilterSeries('all'); }} className="text-sm text-white hover:text-red-100 font-medium bg-white/20 px-3 py-1 rounded-lg">
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-br from-red-400 via-slate-300 to-gray-400">
              {isLoadingCards ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-red-500 mb-4" size={48} />
                  <p className="text-gray-600">Chargement des cartes...</p>
                </div>
              ) : filteredAndSortedCards.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAndSortedCards.map((card) => (
                    <div key={card.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-red-300 relative group">
                      {card.price && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {card.price.toFixed(2)}€
                        </div>
                      )}
                      
                      <img src={card.smallImage} alt={card.name} className="w-full rounded-lg shadow-md mb-3 group-hover:shadow-xl transition-shadow" loading="lazy" />
                      
                      <div className="text-sm space-y-2">
                        <p className="font-semibold text-gray-800 truncate text-center">{card.set}</p>
                        <div className="flex justify-center">
                          <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${RARITY_COLORS[card.rarity] || 'bg-gray-100'}`}>
                            {card.rarity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>#{card.number}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {card.cardmarketUrl && (
                          <a href={card.cardmarketUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition text-center font-medium shadow-md hover:shadow-lg">
                            📊 Voir sur Cardmarket
                          </a>
                        )}
                        <button disabled={!COLLECTION_ENABLED} title={!COLLECTION_ENABLED ? "Bientôt disponible" : ""} className={`w-full py-2 text-xs rounded-lg transition font-medium ${COLLECTION_ENABLED ? 'bg-slate-700 text-white hover:bg-slate-800 cursor-pointer shadow-md hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'}`}>
                          ⭐ Ajouter à ma collection
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedPokemonCards.length > 0 ? (
                <div className="text-center py-12">
                  <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune carte ne correspond aux filtres</p>
                  <button onClick={() => { setCardSearchTerm(''); setFilterRarity('all'); setFilterSeries('all'); }} className="mt-4 text-red-600 hover:text-red-700 font-medium">
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Grid3x3 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune carte trouvée pour ce Pokémon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}