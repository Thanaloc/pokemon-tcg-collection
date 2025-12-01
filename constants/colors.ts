export const THEME = {
  primary: {
    background: 'bg-slate-900',
    surface: 'bg-slate-800',
    accent: 'text-red-400',
    accentMuted: 'text-red-300/70',
    accentBorder: 'border-red-500/30',
    accentBg: 'from-red-500/10 to-orange-500/10',
  }
} as const;

export const TYPE_COLORS: Record<string, string> = {
  Grass: 'bg-green-600 text-white',
  Fire: 'bg-red-600 text-white',
  Water: 'bg-blue-600 text-white',
  Lightning: 'bg-yellow-400 text-gray-900',
  Psychic: 'bg-purple-600 text-white',
  Fighting: 'bg-orange-500 text-white',
  Colorless: 'bg-gray-400 text-white',
  Darkness: 'bg-slate-800 text-white',
  Metal: 'bg-gray-500 text-white',
  Fairy: 'bg-pink-500 text-white',
  Dragon: 'bg-indigo-600 text-white',
};

export const RARITY_COLORS: Record<string, string> = {
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