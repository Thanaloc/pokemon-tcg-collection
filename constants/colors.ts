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
