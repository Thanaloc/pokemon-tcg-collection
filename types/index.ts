
export type SortOption = 'set' | 'rarity' | 'number' | 'price';

export interface Pokemon {
  id: number;
  name: string;
  nameEn?: string;
  cardCount?: number;
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
export type CollectionSort = 'set' | 'pokemon' | 'price' | 'quantity' | 'recent';

export interface CollectionItem {
  id: number;
  quantity: number;
  addedAt: string;
  card: {
    id: string;
    name: string;
    number: string;
    rarity: string;
    image: string;
    smallImage: string;
    set: string;
    series: string;
    price: number | null;
    pokemon: {
      id: number;
      name: string;
    };
  };
}

export interface CollectionStats {
  distinctCards: number;
  totalCopies: number;
  totalValue: number;
}

export interface CollectionResponse {
  collections: CollectionItem[];
  total: number;
  page: number;
  totalPages: number;
  stats: CollectionStats;
}
