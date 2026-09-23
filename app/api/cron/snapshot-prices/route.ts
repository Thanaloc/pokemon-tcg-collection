import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rejectUnauthorizedCron } from '@/lib/cron';
import { mapWithConcurrency, tcgdexFetch, type TcgdexCard } from '@/lib/tcgdex/client';
import { applyRefreshes, toRefresh, type CardRefresh } from '@/lib/tcgdex/sync';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const BUDGET_MS = 260_000;

export async function GET(request: Request) {
  const rejected = rejectUnauthorizedCron(request);
  if (rejected) return rejected;

  const deadline = Date.now() + BUDGET_MS;
  try {
    console.log('📈 Starting price snapshot cron...');

    const pinned = await prisma.pinnedCard.findMany({
      select: { cardId: true },
      distinct: ['cardId'],
    });
    const pinnedCardIds = pinned.map(p => p.cardId);

    if (pinnedCardIds.length === 0) {
      return NextResponse.json({
        success: true,
        stats: { pinnedCards: 0, snapshotsCreated: 0, errors: 0 },
      });
    }

    // A card is LOW confidence if its (set, name) pair has several rarities:
    // TCGdex FR is known to mix up prices between those versions.
    const lowConfidence = new Set(
      (await prisma.$queryRaw<{ id: string }[]>`
        SELECT p.id FROM cards p
        WHERE p.id = ANY(${pinnedCardIds}::text[])
          AND (SELECT COUNT(DISTINCT c.rarity) FROM cards c
               WHERE c.set_id = p.set_id AND c.name = p.name) > 1`
      ).map(row => row.id),
    );

    const results = await mapWithConcurrency(
      pinnedCardIds,
      8,
      cardId => tcgdexFetch<TcgdexCard>(`/cards/${encodeURIComponent(cardId)}`),
      () => Date.now() < deadline,
    );

    const snapshots: { cardId: string; cardmarketPrice: number; confidence: 'HIGH' | 'LOW' }[] = [];
    const refreshes: CardRefresh[] = [];
    let errors = 0;
    let skipped = 0;

    results.forEach((result, index) => {
      const cardId = pinnedCardIds[index];
      if (result.status === 'skipped') {
        skipped++;
      } else if (result.status === 'error') {
        errors++;
        console.error(`Error snapshotting card ${cardId}:`, result.error);
      } else if (result.value) {
        const refresh = toRefresh(result.value);
        refreshes.push(refresh);
        if (refresh.price !== null) {
          snapshots.push({
            cardId,
            cardmarketPrice: refresh.price,
            confidence: lowConfidence.has(cardId) ? 'LOW' : 'HIGH',
          });
        }
      }
    });

    // Keep the "current price" shown on the dashboard in line with the chart.
    await applyRefreshes(prisma, refreshes, refreshes.map(r => r.id));
    const { count } = await prisma.priceHistory.createMany({ data: snapshots });

    console.log(`✅ Snapshot complete: ${count} created, ${errors} errors, ${skipped} skipped`);

    return NextResponse.json({
      success: true,
      stats: {
        pinnedCards: pinnedCardIds.length,
        snapshotsCreated: count,
        errors,
        skipped,
      },
    });
  } catch (error) {
    console.error('❌ Snapshot cron failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
