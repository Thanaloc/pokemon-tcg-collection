import type { PrismaClient } from '@prisma/client';
import {
  extractCardmarketPrice,
  extractImages,
  isPokemonCard,
  mapWithConcurrency,
  tcgdexFetch,
  type TcgdexCard,
  type TcgdexSet,
  type TcgdexSetBrief,
} from './client';
import { fetchPocketSetIds, isPocketSet, isPocketSetId } from './pocket';
import { createPokemonMatcher } from './pokemon-matcher';

export interface SyncOptions {
  /** Epoch ms after which no new TCGdex request is started. Omit for no limit. */
  deadline?: number;
  log?: (message: string) => void;
  concurrency?: number;
}

function timeChecker(deadline?: number) {
  return () => deadline === undefined || Date.now() < deadline;
}

function parseReleaseDate(value?: string): Date {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : new Date('2000-01-01');
}

export interface CardRefresh {
  id: string;
  name: string | null;
  rarity: string | null;
  imageFr: string | null;
  imageSmallFr: string | null;
  price: number | null;
}

export function toRefresh(card: TcgdexCard): CardRefresh {
  return {
    id: card.id,
    name: card.name || null,
    rarity: card.rarity || null,
    ...extractImages(card),
    price: extractCardmarketPrice(card),
  };
}

/** Bulk-writes refreshed card data + prices and stamps `price_checked_at`. */
export async function applyRefreshes(prisma: PrismaClient, refreshes: CardRefresh[], checkedIds: string[]) {
  if (refreshes.length > 0) {
    await prisma.$executeRaw`
      UPDATE cards AS c SET
        name = COALESCE(t.name, c.name),
        rarity = COALESCE(t.rarity, c.rarity),
        image_fr = COALESCE(t.image_fr, c.image_fr),
        image_small_fr = COALESCE(t.image_small_fr, c.image_small_fr)
      FROM UNNEST(
        ${refreshes.map(r => r.id)}::text[],
        ${refreshes.map(r => r.name)}::text[],
        ${refreshes.map(r => r.rarity)}::text[],
        ${refreshes.map(r => r.imageFr)}::text[],
        ${refreshes.map(r => r.imageSmallFr)}::text[]
      ) AS t(id, name, rarity, image_fr, image_small_fr)
      WHERE c.id = t.id`;
  }

  const priced = refreshes.filter(r => r.price !== null);
  if (priced.length > 0) {
    await prisma.$executeRaw`
      INSERT INTO prices (card_id, cardmarket_price, updated_at)
      SELECT t.id, t.price, NOW()
      FROM UNNEST(
        ${priced.map(r => r.id)}::text[],
        ${priced.map(r => r.price)}::float8[]
      ) AS t(id, price)
      ON CONFLICT (card_id) DO UPDATE
        SET cardmarket_price = EXCLUDED.cardmarket_price, updated_at = EXCLUDED.updated_at`;
  }

  if (checkedIds.length > 0) {
    await prisma.$executeRaw`
      UPDATE cards SET price_checked_at = NOW() WHERE id = ANY(${checkedIds}::text[])`;
  }

  return priced.length;
}

export interface CatalogStats {
  setsSeen: number;
  pocketSetsSkipped: number;
  setsCreated: number;
  setsUpdated: number;
  setsSynced: number;
  setsPending: number;
  setErrors: number;
  cardsAdded: number;
  cardErrors: number;
  unmatchedCards: number;
}

/**
 * Adds new sets/cards from TCGdex and repairs set metadata.
 *
 * Every set's detail is fetched (≈200 cheap requests) because only that
 * endpoint exposes the serie, the release date and the card list. Individual
 * cards are fetched only for sets whose card count changed since their last
 * complete sync, newest sets first, so new releases land even when the time
 * budget runs out. A set is marked synced only once all its cards were
 * processed; anything unfinished is picked up by the next run.
 */
export async function syncCatalog(prisma: PrismaClient, options: SyncOptions = {}): Promise<CatalogStats> {
  const log = options.log ?? console.log;
  const concurrency = options.concurrency ?? 8;
  const canContinue = timeChecker(options.deadline);
  const stats: CatalogStats = {
    setsSeen: 0, pocketSetsSkipped: 0, setsCreated: 0, setsUpdated: 0, setsSynced: 0,
    setsPending: 0, setErrors: 0, cardsAdded: 0, cardErrors: 0, unmatchedCards: 0,
  };

  const briefs = await tcgdexFetch<TcgdexSetBrief[]>('/sets');
  if (!Array.isArray(briefs)) throw new Error('Invalid sets data from TCGdex');
  stats.setsSeen = briefs.length;

  const pocketIds = await fetchPocketSetIds();
  const candidates = briefs.filter(set => !pocketIds.has(set.id) && !isPocketSetId(set.id));
  stats.pocketSetsSkipped = briefs.length - candidates.length;

  const detailResults = await mapWithConcurrency(
    candidates,
    concurrency,
    set => tcgdexFetch<TcgdexSet>(`/sets/${encodeURIComponent(set.id)}`),
    canContinue,
  );

  const sets: TcgdexSet[] = [];
  detailResults.forEach((result, index) => {
    if (result.status === 'ok' && result.value) {
      if (isPocketSet(result.value)) stats.pocketSetsSkipped++;
      else sets.push(result.value);
    } else if (result.status === 'error') {
      stats.setErrors++;
      log(`❌ Set ${candidates[index].id}: ${String(result.error)}`);
    } else if (result.status === 'skipped') {
      stats.setsPending++;
    }
  });

  const dbSets = new Map(
    (await prisma.set.findMany()).map(set => [set.id, set]),
  );

  for (const set of sets) {
    const data = {
      name: set.name,
      series: set.serie?.name || 'Unknown',
      releaseDate: parseReleaseDate(set.releaseDate),
    };
    const existing = dbSets.get(set.id);
    if (!existing) {
      await prisma.set.create({ data: { id: set.id, ...data } });
      stats.setsCreated++;
      log(`➕ New set: ${set.name} (${set.id})`);
    } else if (
      existing.name !== data.name ||
      existing.series !== data.series ||
      existing.releaseDate.getTime() !== data.releaseDate.getTime()
    ) {
      await prisma.set.update({ where: { id: set.id }, data });
      stats.setsUpdated++;
    }
  }

  const changedSets = sets
    .filter(set => (set.cards?.length ?? 0) !== dbSets.get(set.id)?.syncedCardCount)
    .sort((a, b) => parseReleaseDate(b.releaseDate).getTime() - parseReleaseDate(a.releaseDate).getTime());

  if (changedSets.length === 0) return stats;

  const matchPokemon = createPokemonMatcher(
    await prisma.pokemon.findMany({ select: { id: true, nameFr: true, nameEn: true } }),
  );
  const knownCardIds = new Set(
    (await prisma.card.findMany({ select: { id: true } })).map(card => card.id),
  );

  for (let i = 0; i < changedSets.length; i++) {
    if (!canContinue()) {
      stats.setsPending += changedSets.length - i;
      break;
    }

    const set = changedSets[i];
    const listed = set.cards ?? [];
    const missing = listed.filter(card => !knownCardIds.has(card.id));

    const results = await mapWithConcurrency(
      missing,
      concurrency,
      card => tcgdexFetch<TcgdexCard>(`/cards/${encodeURIComponent(card.id)}`),
      canContinue,
    );

    let incomplete = false;
    const newCards: TcgdexCard[] = [];
    results.forEach((result, index) => {
      if (result.status === 'skipped') {
        incomplete = true;
      } else if (result.status === 'error') {
        incomplete = true;
        stats.cardErrors++;
        log(`❌ Card ${missing[index].id}: ${String(result.error)}`);
      } else if (result.value && isPokemonCard(result.value)) {
        newCards.push(result.value);
      }
    });

    const rows = [];
    let unmatchedInSet = 0;
    for (const card of newCards) {
      const pokemonId = matchPokemon(card);
      if (pokemonId === null) {
        stats.unmatchedCards++;
        unmatchedInSet++;
        log(`⚠️  No Pokémon match: ${card.name} (${card.id})`);
        continue;
      }
      rows.push({
        id: card.id,
        pokemonId,
        setId: set.id,
        number: card.localId || '',
        name: card.name,
        rarity: card.rarity || 'Sans Rareté',
        ...extractImages(card),
      });
    }

    if (rows.length > 0) {
      const { count } = await prisma.card.createMany({ data: rows, skipDuplicates: true });
      stats.cardsAdded += count;
      rows.forEach(row => knownCardIds.add(row.id));
      const inserted = new Set(rows.map(row => row.id));
      const refreshes = newCards.filter(card => inserted.has(card.id)).map(toRefresh);
      await applyRefreshes(prisma, refreshes, [...inserted]);
      log(`🃏 ${set.name}: +${count} cards`);
    }

    if (incomplete) {
      stats.setsPending++;
    } else if (unmatchedInSet > 0) {
      // Left unsynced on purpose: the next run retries these cards (cheap, only
      // the cards missing from the database), so a fix to the matcher or to
      // TCGdex data brings them in without any manual step.
    } else {
      await prisma.set.update({
        where: { id: set.id },
        data: { syncedCardCount: listed.length },
      });
      stats.setsSynced++;
    }
  }

  return stats;
}

export interface PriceStats {
  cardsChecked: number;
  pricesUpdated: number;
  errors: number;
}

/**
 * Refreshes prices (and name/rarity/images) for the cards checked the longest
 * time ago, until the deadline. Each run continues where the previous one
 * stopped, so the whole catalogue rotates over a few daily runs.
 */
export async function refreshPrices(
  prisma: PrismaClient,
  options: SyncOptions & { maxAgeHours?: number; batchSize?: number; cardIds?: string[] } = {},
): Promise<PriceStats> {
  const log = options.log ?? console.log;
  const concurrency = options.concurrency ?? 8;
  const canContinue = timeChecker(options.deadline);
  const cutoff = new Date(Date.now() - (options.maxAgeHours ?? 20) * 3600 * 1000);
  const stats: PriceStats = { cardsChecked: 0, pricesUpdated: 0, errors: 0 };

  while (canContinue()) {
    const batch = await prisma.card.findMany({
      where: {
        ...(options.cardIds ? { id: { in: options.cardIds } } : {}),
        OR: [{ priceCheckedAt: null }, { priceCheckedAt: { lt: cutoff } }],
      },
      select: { id: true },
      orderBy: [{ priceCheckedAt: { sort: 'asc', nulls: 'first' } }, { id: 'asc' }],
      take: options.batchSize ?? 100,
    });
    if (batch.length === 0) break;

    const results = await mapWithConcurrency(
      batch,
      concurrency,
      card => tcgdexFetch<TcgdexCard>(`/cards/${encodeURIComponent(card.id)}`),
      canContinue,
    );

    const refreshes: CardRefresh[] = [];
    const checkedIds: string[] = [];
    let attempted = 0;
    let failed = 0;
    results.forEach((result, index) => {
      if (result.status === 'skipped') return;
      attempted++;
      // Stamp failures too, otherwise one broken card would stay at the head
      // of the queue forever. It comes back on the next rotation.
      checkedIds.push(batch[index].id);
      if (result.status === 'error') {
        failed++;
        log(`❌ Price ${batch[index].id}: ${String(result.error)}`);
      } else if (result.value) {
        refreshes.push(toRefresh(result.value));
      }
    });

    stats.pricesUpdated += await applyRefreshes(prisma, refreshes, checkedIds);
    stats.cardsChecked += attempted;
    stats.errors += failed;

    if (attempted > 0 && failed === attempted) {
      log('🛑 Every request in the batch failed, TCGdex looks down: stopping.');
      break;
    }
  }

  return stats;
}
