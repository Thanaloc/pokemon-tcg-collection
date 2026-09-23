// Removes the Pokémon TCG Pocket sets (and their cards) that leaked into the
// database. Dry run by default, nothing is deleted without --apply.
//   npm run cleanup:pocket
//   npm run cleanup:pocket -- --apply
import './load-env';
import { prisma } from '@/lib/prisma';
import { fetchPocketSetIds, isPocketSetId } from '@/lib/tcgdex/pocket';

async function main() {
  const apply = process.argv.includes('--apply');

  const fromTcgdex = await fetchPocketSetIds();
  if (fromTcgdex.size === 0) {
    console.warn('⚠️  Could not load the Pocket serie from TCGdex, relying on set id patterns only.');
  }

  const sets = (await prisma.set.findMany({ orderBy: { id: 'asc' } }))
    .filter(set => fromTcgdex.has(set.id) || isPocketSetId(set.id) || /pocket/i.test(set.series));

  if (sets.length === 0) {
    console.log('✅ No TCG Pocket set in the database.');
    return;
  }

  const setIds = sets.map(set => set.id);
  const cards = await prisma.card.findMany({ where: { setId: { in: setIds } }, select: { id: true } });
  const cardIds = cards.map(card => card.id);
  const [collections, pins] = await Promise.all([
    prisma.userCollection.count({ where: { cardId: { in: cardIds } } }),
    prisma.pinnedCard.count({ where: { cardId: { in: cardIds } } }),
  ]);

  console.table(sets.map(set => ({ id: set.id, name: set.name, series: set.series })));
  console.log(`${cards.length} cards, ${collections} collection entries, ${pins} pins would be removed.`);

  if (!apply) {
    console.log('\nDry run: nothing deleted. Re-run with --apply to delete.');
    return;
  }

  await prisma.$transaction([
    prisma.price.deleteMany({ where: { cardId: { in: cardIds } } }),
    prisma.userCollection.deleteMany({ where: { cardId: { in: cardIds } } }),
    // price_history and pinned_cards cascade on card deletion.
    prisma.card.deleteMany({ where: { id: { in: cardIds } } }),
    prisma.set.deleteMany({ where: { id: { in: setIds } } }),
  ]);
  console.log(`🗑️  Removed ${sets.length} sets and ${cards.length} cards.`);
}

main()
  .catch(error => {
    console.error('❌ Cleanup failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
