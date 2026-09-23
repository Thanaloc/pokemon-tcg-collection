// Manual equivalent of the /api/cron/update route, without time budget.
//   npm run update                 new sets/cards + prices older than 20h
//   npm run update -- --no-prices  catalogue only
//   npm run update -- --all-prices refresh every price, whatever its age
import './load-env';
import { prisma } from '@/lib/prisma';
import { refreshPrices, syncCatalog } from '@/lib/tcgdex/sync';

async function main() {
  const args = new Set(process.argv.slice(2));

  console.log('🔄 Syncing catalogue from TCGdex...');
  const catalog = await syncCatalog(prisma);
  console.table(catalog);

  if (!args.has('--no-prices')) {
    console.log('💰 Refreshing prices...');
    const prices = await refreshPrices(prisma, {
      maxAgeHours: args.has('--all-prices') ? 0 : 20,
    });
    console.table(prices);
  }
}

main()
  .catch(error => {
    console.error('❌ Update failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
