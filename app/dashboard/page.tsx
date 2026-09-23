import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import SiteNav from '@/components/Header/SiteNav';
import { buildCardmarketUrl } from '@/lib/cardmarket';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const pins = await prisma.pinnedCard.findMany({
    where: { userId: session.user.id },
    include: {
      card: {
        include: {
          set: true,
          pokemon: true,
          price: true,
        },
      },
    },
    orderBy: { pinnedAt: 'desc' },
  });

    const formattedPins = pins.map(p => ({
    id: p.id,
    pinnedAt: p.pinnedAt.toISOString(),
    card: {
      id: p.card.id,
      name: p.card.name,
      number: p.card.number,
      rarity: p.card.rarity,
      image: p.card.imageFr || p.card.imageEn || '/placeholder-card.svg',
      smallImage: p.card.imageSmallFr || p.card.imageSmallEn || '/placeholder-card.svg',
      set: p.card.set.name,
      series: p.card.set.series,
      currentPrice: p.card.price?.cardmarketPrice ?? null,
      cardmarketUrl: buildCardmarketUrl({
        name: p.card.name,
        number: p.card.number,
      }),
      pokemon: {
        id: p.card.pokemon.id,
        name: p.card.pokemon.nameFr,
      },
    },
  }));

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold text-white">Suivi des prix</h1>
        <p className="text-sm text-slate-400 mt-1 mb-6">
          Évolution du prix Cardmarket des cartes que vous suivez, relevé chaque jour.
        </p>
        <DashboardClient initialPins={formattedPins} />
      </main>
    </div>
  );
}
