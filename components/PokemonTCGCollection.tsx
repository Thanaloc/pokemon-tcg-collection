'use client';

import React, { useState, useEffect } from 'react';
import { Search, Grid3x3, X, Loader2 } from 'lucide-react';

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
  'Grass': 'bg-green-100 text-green-800',
  'Fire': 'bg-red-100 text-red-800',
  'Water': 'bg-blue-100 text-blue-800',
  'Lightning': 'bg-yellow-100 text-yellow-800',
  'Psychic': 'bg-purple-100 text-purple-800',
  'Fighting': 'bg-orange-100 text-orange-800',
  'Colorless': 'bg-gray-100 text-gray-800',
  'Darkness': 'bg-slate-800 text-white',
  'Metal': 'bg-gray-400 text-gray-900',
  'Fairy': 'bg-pink-100 text-pink-800',
  'Dragon': 'bg-indigo-100 text-indigo-800',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Pokémon TCG Collection
          </h1>
          
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un Pokémon (nom ou numéro)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 p-4"
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
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedPokemon.name} - Toutes les cartes
                </h2>
                {!isLoadingCards && (
                  <p className="text-sm text-gray-500">
                    {selectedPokemonCards.length} cartes disponibles
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedPokemon(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Grille de cartes */}
            <div className="p-6">
              {isLoadingCards ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                  <p className="text-gray-600">Chargement des cartes...</p>
                </div>
              ) : selectedPokemonCards.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedPokemonCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
                    >
                      <img
                        src={card.smallImage}
                        alt={card.name}
                        className="w-full rounded-lg shadow-md mb-2"
                        loading="lazy"
                      />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800 truncate">{card.set}</p>
                        <p className="text-xs text-gray-500">{card.rarity}</p>
                        <p className="text-xs text-gray-400">#{card.number}</p>
                      </div>
                      {/* Bouton désactivé en attendant l'implémentation */}
                      <button 
                        disabled={!COLLECTION_ENABLED}
                        title={!COLLECTION_ENABLED ? "Bientôt disponible" : ""}
                        className={`w-full mt-2 py-1 text-xs rounded transition ${
                          COLLECTION_ENABLED 
                            ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        + Ajouter à ma collection
                      </button>
                    </div>
                  ))}
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