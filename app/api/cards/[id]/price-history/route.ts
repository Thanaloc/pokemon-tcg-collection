import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const RANGE_TO_DAYS: Record<string, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  'all': null,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: cardId } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    if (!(range in RANGE_TO_DAYS)) {
      return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
    }

    // Only let users read history for cards they have pinned themselves.
    const pin = await prisma.pinnedCard.findUnique({
      where: { userId_cardId: { userId: session.user.id, cardId } },
    });
    if (!pin) {
      return NextResponse.json({ error: 'Not pinned' }, { status: 403 });
    }

    const days = RANGE_TO_DAYS[range];
    const where: any = { cardId };
    if (days !== null) {
      where.snapshotAt = {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      };
    }

    const history = await prisma.priceHistory.findMany({
      where,
      select: { snapshotAt: true, cardmarketPrice: true, confidence: true },
      orderBy: { snapshotAt: 'asc' },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}