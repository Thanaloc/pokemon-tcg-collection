
export type SortOption = 'set' | 'rarity' | 'number' | 'price';

export interface Pokemon {
  id: number;
  name: string;
  number: string;
  types: string[];
  imageUrl: string;
}

export interface Card {
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

export interface CardFilters {
  searchTerm: string;
  sortBy: SortOption;
  rarity: string;
  series: string;
}