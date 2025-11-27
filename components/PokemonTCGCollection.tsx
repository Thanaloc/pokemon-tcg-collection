'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Grid3x3, X, Loader2, Filter, SortAsc, Award } from 'lucide-react';

// Feature flag - à activer plus tard
const COLLECTION_ENABLED = false;

// Types TypeScript
type PokemonType = 'Grass' | 'Fire' | 'Water' | 'Lightning' | 'Psychic' | 'Fighting' | 'Colorless' | 'Darkness' | 'Metal' | 'Fairy' | 'Dragon';

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
  'Shiny Rare VMAX': 'bg-gradient-to-r from-gray-100 via-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 text-white',
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
  const [sortBy, setSortBy] = useState<'set' | 'rarity' | 'number'>('set');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterSeries, setFilterSeries] = useState<string>('all');

  // Statistiques globales
  const [totalCards, setTotalCards] = useState(0);
  const [pokemonCardCounts, setPokemonCardCounts] = useState<Record<number, number>>({});

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
      console.log('Loading Pokemon...');
      const response = await fetch('/api/pokemon');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur API');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        console.log('Loaded', data.length, 'Pokemon');
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

  // Calculer les statistiques
  useEffect(() => {
    let total = 0;
    selectedPokemonCards.forEach(() => total++);
    setTotalCards(total);
  }, [selectedPokemonCards]);

  // Filtrer et trier les cartes
  const filteredAndSortedCards = useMemo(() => {
    let cards = [...selectedPokemonCards];

    // Filtrer par recherche
    if (cardSearchTerm.trim()) {
      cards = cards.filter(card =>
        card.set.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
        card.series.toLowerCase().includes(cardSearchTerm.toLowerCase())
      );
    }

    // Filtrer par rareté
    if (filterRarity !== 'all') {
      cards = cards.filter(card => card.rarity === filterRarity);
    }

    // Filtrer par série
    if (filterSeries !== 'all') {
      cards = cards.filter(card => card.series === filterSeries);
    }

    // Trier
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'set':
          return a.set.localeCompare(b.set);
        case 'rarity':
          const rarityOrder = ['Commune', 'Peu commune', 'Rare', 'Ultra-rare', 'Secrète'];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        case 'number':
          return parseInt(a.number) - parseInt(b.number);
        default:
          return 0;
      }
    });

    return cards;
  }, [selectedPokemonCards, cardSearchTerm, filterRarity, filterSeries, sortBy]);

  // Extraire les raretés et séries uniques
  const uniqueRarities = useMemo(() => {
    return [...new Set(selectedPokemonCards.map(c => c.rarity))].filter(Boolean);
  }, [selectedPokemonCards]);

  const uniqueSeries = useMemo(() => {
    return [...new Set(selectedPokemonCards.map(c => c.series))].filter(Boolean);
  }, [selectedPokemonCards]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Pokémon TCG Collection
            </h1>

            {/* Statistiques globales */}
            {!isLoadingPokemon && (
              <div className="flex gap-4 items-center">
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold">POKÉMON</p>
                  <p className="text-2xl font-bold text-blue-800">{allPokemon.length}</p>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-lg">
                  <p className="text-xs text-purple-600 font-semibold">CARTES TOTALES</p>
                  <p className="text-2xl font-bold text-purple-800">~25,000+</p>
                </div>
              </div>
            )}
          </div>



          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" size={20} />
            <input
              type="text"
              placeholder="Rechercher un Pokémon (nom ou numéro)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
            />

          </div>

          {!isLoadingPokemon && (
            <p className="text-sm text-gray-500 mt-2">
              {filteredPokemon.length} Pokémon trouvés
            </p>
          )}
        </div>
      </header>

      {/* Grille de Pokémon - Pokédex */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={loadAllPokemon}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        ) : isLoadingPokemon ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-gray-600">Chargement du Pokédex...</p>
            <p className="text-sm text-gray-400 mt-2">(Première fois = ~30 secondes)</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredPokemon.map((pokemon) => (
                <div
                  key={`${pokemon.id}-${pokemon.name}`}
                  onClick={() => setSelectedPokemon(pokemon)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 p-4 relative border border-gray-100"
                >
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="w-full h-32 object-contain mb-2"
                    loading="lazy"
                  />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-mono">#{pokemon.number}</p>
                    <h3 className="font-bold text-gray-800">{pokemon.name}</h3>
                    <div className="flex gap-1 justify-center mt-2 flex-wrap">
                      {pokemon.types.slice(0, 2).map((type, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[type] || 'bg-gray-100'}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPokemon.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun Pokémon trouvé</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal - Vue des cartes du Pokémon */}
      {selectedPokemon && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPokemon(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedPokemon.name} - Toutes les cartes
                  </h2>
                  {!isLoadingCards && (
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Award className="text-blue-500" size={16} />
                        <span className="text-sm text-gray-600">
                          <strong>{selectedPokemonCards.length}</strong> cartes disponibles
                        </span>
                      </div>
                      {filteredAndSortedCards.length !== selectedPokemonCards.length && (
                        <span className="text-sm text-gray-500">
                          ({filteredAndSortedCards.length} affichées)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPokemon(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Filtres et tri */}
              {!isLoadingCards && selectedPokemonCards.length > 0 && (
                <div className="space-y-3">
                  {/* Barre de recherche des cartes */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher par set ou série..."
                      value={cardSearchTerm}
                      onChange={(e) => setCardSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Tri */}
                    <div className="flex items-center gap-2">
                      <SortAsc size={16} className="text-gray-800" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-sm border border-gray-500 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                      >
                        <option value="set">Trier par Set</option>
                        <option value="rarity">Trier par Rareté</option>
                        <option value="number">Trier par Numéro</option>
                      </select>
                    </div>

                    {/* Filtre rareté */}
                    {uniqueRarities.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-800" />
                        <select
                          value={filterRarity}
                          onChange={(e) => setFilterRarity(e.target.value)}
                          className="text-sm border border-gray-500 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                        >
                          <option value="all">Toutes raretés</option>
                          {uniqueRarities.map(rarity => (
                            <option key={rarity} value={rarity}>{rarity}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Filtre série */}
                    {uniqueSeries.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500" />
                        <select
                          value={filterSeries}
                          onChange={(e) => setFilterSeries(e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Toutes séries</option>
                          {uniqueSeries.map(series => (
                            <option key={series} value={series}>{series}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Bouton reset filtres */}
                    {(cardSearchTerm || filterRarity !== 'all' || filterSeries !== 'all') && (
                      <button
                        onClick={() => {
                          setCardSearchTerm('');
                          setFilterRarity('all');
                          setFilterSeries('all');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Grille de cartes */}
            <div className="p-6">
              {isLoadingCards ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                  <p className="text-gray-600">Chargement des cartes...</p>
                </div>
              ) : filteredAndSortedCards.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAndSortedCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white rounded-lg p-3 hover:shadow-lg hover:scale-105 transition-all border border-gray-100"
                    >
                      <img
                        src={card.smallImage}
                        alt={card.name}
                        className="w-full rounded-lg shadow-md mb-2"
                        loading="lazy"
                      />
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-gray-800 truncate">{card.set}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${RARITY_COLORS[card.rarity] || 'bg-gray-100'}`}>
                          {card.rarity}
                        </span>
                        <p className="text-xs text-gray-400">#{card.number}</p>
                      </div>
                      {/* Bouton désactivé en attendant l'implémentation */}
                      <button
                        disabled={!COLLECTION_ENABLED}
                        title={!COLLECTION_ENABLED ? "Bientôt disponible" : ""}
                        className={`w-full mt-2 py-1 text-xs rounded transition ${COLLECTION_ENABLED
                            ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                          }`}
                      >
                        + Ajouter à ma collection
                      </button>
                    </div>
                  ))}
                </div>
              ) : selectedPokemonCards.length > 0 ? (
                <div className="text-center py-12">
                  <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune carte ne correspond aux filtres</p>
                  <button
                    onClick={() => {
                      setCardSearchTerm('');
                      setFilterRarity('all');
                      setFilterSeries('all');
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
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