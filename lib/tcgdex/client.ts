// Minimal TCGdex REST client shared by the cron routes and the CLI scripts.
// Only the fields we actually read are typed.

export const TCGDEX_API = process.env.TCGDEX_API_URL || 'https://api.tcgdex.net/v2/fr';

export interface TcgdexSetBrief {
  id: string;
  name: string;
  cardCount?: { total: number; official: number };
}

export interface TcgdexCardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

// `/sets/:id` — unlike the `/sets` list, it carries the serie and release date.
export interface TcgdexSet extends TcgdexSetBrief {
  serie?: { id: string; name: string };
  releaseDate?: string;
  cards?: TcgdexCardBrief[];
}

export interface TcgdexSerie {
  id: string;
  name: string;
  sets?: TcgdexSetBrief[];
}

export interface TcgdexCard extends TcgdexCardBrief {
  category?: string;
  rarity?: string;
  dexId?: number[];
  pricing?: {
    cardmarket?: Record<string, number | string | null> | null;
  } | null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * GET a TCGdex endpoint (path relative to the language root, e.g. `/sets`).
 * Returns null on 404, retries network errors / 5xx / 429 with backoff.
 */
export async function tcgdexFetch<T>(path: string, retries = 3): Promise<T | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(`${TCGDEX_API}${path}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
        cache: 'no-store',
      });

      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status} on ${path}`);
      return (await response.json()) as T;
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await sleep(1000 * (attempt + 1));
    }
  }
  return null;
}

export type TaskResult<R> =
  | { status: 'ok'; value: R }
  | { status: 'error'; error: unknown }
  | { status: 'skipped' };

/**
 * Runs `fn` over `items` with at most `limit` calls in flight.
 * Once `canContinue()` returns false, remaining items are reported as `skipped`
 * so callers can tell "not attempted" apart from "failed".
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
  canContinue: () => boolean = () => true,
): Promise<TaskResult<R>[]> {
  const results: TaskResult<R>[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      if (!canContinue()) {
        results[index] = { status: 'skipped' };
        continue;
      }
      try {
        results[index] = { status: 'ok', value: await fn(items[index]) };
      } catch (error) {
        results[index] = { status: 'error', error };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const PRICE_KEYS = [
  'avg', 'avg7', 'avg30', 'trend',
  'avg-holo', 'avg7-holo', 'avg30-holo', 'trend-holo',
];

export function extractCardmarketPrice(card: TcgdexCard): number | null {
  const cardmarket = card.pricing?.cardmarket;
  if (!cardmarket) return null;
  for (const key of PRICE_KEYS) {
    const value = cardmarket[key];
    if (typeof value === 'number' && value > 0) return value;
  }
  return null;
}

export function extractImages(card: TcgdexCardBrief) {
  if (!card.image) return { imageFr: null, imageSmallFr: null };
  const baseUrl = card.image.startsWith('http')
    ? card.image
    : `https://assets.tcgdex.net${card.image}`;
  return {
    imageFr: `${baseUrl}/high.webp`,
    imageSmallFr: `${baseUrl}/low.jpg`,
  };
}

export function isPokemonCard(card: TcgdexCard): boolean {
  return card.category === 'Pokémon' || card.category === 'Pokemon';
}
