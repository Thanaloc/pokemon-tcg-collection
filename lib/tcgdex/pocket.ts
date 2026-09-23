import { tcgdexFetch, type TcgdexSerie, type TcgdexSet } from './client';

// Pokémon TCG Pocket (the mobile game) lives in TCGdex under its own serie.
// Its set ids look like A1, A1a, A2b, B1, P-A... while paper sets are lowercase
// (base1, sv01, swsh3.5...). The old filter (/^[AB]\d/) missed the promo sets
// (P-A, P-B) and any future letter, which is how Pocket cards leaked in.
export const POCKET_SERIE_ID = 'tcgp';
export const POCKET_SET_ID_PATTERN = /^(?:[A-Z]\d+[a-z]?|P-[A-Z])$/;

export function isPocketSetId(id: string): boolean {
  return POCKET_SET_ID_PATTERN.test(id);
}

export function isPocketSet(set: TcgdexSet): boolean {
  if (isPocketSetId(set.id)) return true;
  if (set.serie?.id === POCKET_SERIE_ID) return true;
  return /pocket/i.test(set.serie?.name ?? '');
}

/** Authoritative list from TCGdex; empty if the endpoint can't be reached. */
export async function fetchPocketSetIds(): Promise<Set<string>> {
  try {
    const serie = await tcgdexFetch<TcgdexSerie>(`/series/${POCKET_SERIE_ID}`);
    return new Set((serie?.sets ?? []).map(set => set.id));
  } catch {
    return new Set();
  }
}
