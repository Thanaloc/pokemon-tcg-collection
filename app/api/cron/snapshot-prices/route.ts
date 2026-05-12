import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TCGDEX_API = 'https://api.tcgdex.net/v2/fr';

async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📈 Starting price snapshot cron...');

    const pinned = await prisma.pinnedCard.findMany({
      select: { cardId: true },
      distinct: ['cardId'],
    });
    const pinnedCardIds = pinned.map(p => p.cardId);

    if (pinnedCardIds.length === 0) {
      console.log('No pinned cards, skipping');
      return NextResponse.json({
        success: true,
        stats: { pinnedCards: 0, snapshotsCreated: 0, errors: 0 },
      });
    }

    // Precompute confidence: a card is LOW if its (set, name) pair has multiple
    // rarities in our DB — TCGdex FR is known to mix up prices in that case.
    const pinnedCardsInfo = await prisma.card.findMany({
      where: { id: { in: pinnedCardIds } },
      select: { id: true, setId: true, name: true },
    });

    const confidenceCache = new Map<string, 'HIGH' | 'LOW'>();
    const confidenceByCard = new Map<string, 'HIGH' | 'LOW'>();

    for (const card of pinnedCardsInfo) {
      const cacheKey = `${card.setId}::${card.name}`;
      let confidence = confidenceCache.get(cacheKey);

      if (confidence === undefined) {
        const distinctRarities = await prisma.card.findMany({
          where: { setId: card.setId, name: card.name },
          select: { rarity: true },
          distinct: ['rarity'],
        });
        confidence = distinctRarities.length > 1 ? 'LOW' : 'HIGH';
        confidenceCache.set(cacheKey, confidence);
      }

      confidenceByCard.set(card.id, confidence);
    }

    let snapshotsCreated = 0;
    let errors = 0;

    for (const cardId of pinnedCardIds) {
      try {
        const card = await fetchWithRetry(`${TCGDEX_API}/cards/${cardId}`);
        if (!card) continue;

        const cardmarketPrice = card.pricing?.cardmarket?.avg
          || card.pricing?.cardmarket?.avg7
          || card.pricing?.cardmarket?.avg30
          || null;

        if (!cardmarketPrice || cardmarketPrice <= 0) continue;

        await prisma.priceHistory.create({
          data: {
            cardId,
            cardmarketPrice,
            confidence: confidenceByCard.get(cardId) || 'HIGH',
          },
        });
        snapshotsCreated++;
      } catch (error: any) {
        console.error(`Error snapshotting card ${cardId}:`, error.message);
        errors++;
      }
    }

    console.log(`✅ Snapshot complete: ${snapshotsCreated} created, ${errors} errors`);

    return NextResponse.json({
      success: true,
      stats: {
        pinnedCards: pinnedCardIds.length,
        snapshotsCreated,
        errors,
      },
    });
  } catch (error: any) {
    console.error('❌ Snapshot cron failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}