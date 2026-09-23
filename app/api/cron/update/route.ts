import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rejectUnauthorizedCron } from '@/lib/cron';
import { refreshPrices, syncCatalog } from '@/lib/tcgdex/sync';

// The previous version walked every set and fetched every card (~20k requests)
// in one invocation, oldest sets first: Vercel killed it long before it reached
// new releases. Work is now incremental and bounded by a time budget; whatever
// is left is resumed by the next run.
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const CATALOG_BUDGET_MS = 180_000;
const TOTAL_BUDGET_MS = 260_000;

export async function GET(request: Request) {
  const rejected = rejectUnauthorizedCron(request);
  if (rejected) return rejected;

  const startedAt = Date.now();
  try {
    console.log('🔄 Catalog sync started');
    const catalog = await syncCatalog(prisma, { deadline: startedAt + CATALOG_BUDGET_MS });
    console.log('📦 Catalog sync done', catalog);

    const prices = await refreshPrices(prisma, { deadline: startedAt + TOTAL_BUDGET_MS });
    console.log('💰 Price refresh done', prices);

    return NextResponse.json({
      success: true,
      partial: catalog.setsPending > 0,
      durationMs: Date.now() - startedAt,
      catalog,
      prices,
    });
  } catch (error) {
    console.error('❌ Update failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
