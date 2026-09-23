import type { PrismaClient } from '@prisma/client';
import { isKnownRarity } from '@/constants/rarities';

export interface RarityCount {
  rarity: string;
  cards: number;
  known: boolean;
  example: string;
}

/** Every rarity present in the database, flagged when constants/rarities.ts lacks it. */
export async function rarityReport(prisma: PrismaClient): Promise<RarityCount[]> {
  const rows = await prisma.$queryRaw<{ rarity: string; cards: bigint; example: string }[]>`
    SELECT rarity, COUNT(*) AS cards, MIN(name || ' (' || id || ')') AS example
    FROM cards GROUP BY rarity ORDER BY COUNT(*) DESC`;
  return rows.map(row => ({
    rarity: row.rarity,
    cards: Number(row.cards),
    known: isKnownRarity(row.rarity),
    example: row.example,
  }));
}
