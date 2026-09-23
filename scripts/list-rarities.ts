// Lists every rarity in the database and flags the ones constants/rarities.ts
// doesn't know yet (they get a neutral badge and sort as the rarest).
//   npm run rarities
import './load-env';
import { prisma } from '@/lib/prisma';
import { rarityReport } from '@/lib/rarities-report';

async function main() {
  const report = await rarityReport(prisma);
  console.table(report.map(r => ({ rarity: r.rarity, cards: r.cards, status: r.known ? 'ok' : '🆕 missing', example: r.example })));
  const missing = report.filter(r => !r.known);
  console.log(missing.length
    ? `\n${missing.length} rarity(ies) to add to constants/rarities.ts: ${missing.map(r => `"${r.rarity}"`).join(', ')}`
    : '\n✅ Every rarity is known.');
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
