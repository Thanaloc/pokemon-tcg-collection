// Every TCGdex (FR) rarity the site knows, from most common to rarest: this
// order drives the "Par Rareté" sort, and each entry carries its badge style.
// New rarity from TCGdex? `npm run rarities` lists the ones missing here
// (the update cron also reports them as `unknownRarities`).
export const RARITIES: { name: string; className: string }[] = [
  { name: 'Sans Rareté', className: 'bg-gray-200 text-black' },
  { name: 'Commune', className: 'bg-gray-500 text-white' },
  { name: 'Peu Commune', className: 'bg-green-600 text-white' },
  { name: 'Rare', className: 'bg-blue-600 text-white' },
  { name: 'Promo', className: 'bg-teal-500 text-white' },
  { name: 'Rare Holo', className: 'bg-blue-400 text-white' },
  { name: 'Holo Rare', className: 'bg-blue-400 text-white' },
  { name: 'Rare Holo LV.X', className: 'bg-blue-500 text-white' },
  { name: 'Double rare', className: 'bg-pink-600 text-white' },
  { name: 'Ultra Rare', className: 'bg-purple-600 text-white' },
  { name: 'Holo Rare V', className: 'bg-purple-400 text-white' },
  { name: 'Holo Rare VMAX', className: 'bg-gradient-to-r from-blue-400 via-red-500 to-indigo-600 text-white' },
  { name: 'Holo Rare VSTAR', className: 'bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-600 text-white' },
  { name: 'Radieux Rare', className: 'bg-yellow-300 text-black' },
  { name: 'Illustration rare', className: 'bg-yellow-400 text-black' },
  { name: 'Collection classique', className: 'bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 text-white' },
  { name: 'Shiny Rare', className: 'bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 text-black' },
  { name: 'Rainbow Rare', className: 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 text-white' },
  { name: 'Secrète', className: 'bg-amber-500 text-white' },
  { name: 'Hyper rare', className: 'bg-red-600 text-white' },
  { name: 'Magnifique rare', className: 'bg-gradient-to-r from-red-400 via-orange-400 via-yellow-400 via-green-400 via-blue-500 via-indigo-500 to-purple-600 text-white' },
  { name: 'Illustration spéciale rare', className: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white' },
  { name: 'Shiny rare VMAX', className: 'bg-gradient-to-r from-gray-100 via-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 text-white' },
  { name: 'Chromatique ultra rare', className: 'bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 text-white' },
  { name: 'Méga Hyper Rare', className: 'bg-yellow-600 text-white' },
  { name: 'Rare Noir Blanc', className: 'bg-gradient-to-r from-black to-white text-white' },
];

// Readable badge for rarities not listed yet (it used to be white on light gray).
export const UNKNOWN_RARITY_CLASS = 'bg-slate-600 text-white ring-1 ring-slate-400';

const RANK = new Map(RARITIES.map((rarity, index) => [rarity.name, index]));
const CLASS = new Map(RARITIES.map(rarity => [rarity.name, rarity.className]));

export function isKnownRarity(name: string): boolean {
  return RANK.has(name);
}

/** Higher is rarer. Unknown rarities rank above every known one so they stand out. */
export function rarityRank(name: string): number {
  return RANK.get(name) ?? RARITIES.length;
}

export function rarityClass(name: string): string {
  return CLASS.get(name) ?? UNKNOWN_RARITY_CLASS;
}
