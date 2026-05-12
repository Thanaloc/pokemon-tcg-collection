import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';

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

  const formattedPins = pins.map((p: any) => ({
    id: p.id,
    pinnedAt: p.pinnedAt.toISOString(),
    card: {
      id: p.card.id,
      name: p.card.name,
      number: p.card.number,
      rarity: p.card.rarity,
      image: p.card.imageFr || p.card.imageEn || '/placeholder-card.png',
      smallImage: p.card.imageSmallFr || p.card.imageSmallEn || '/placeholder-card.png',
      set: p.card.set.name,
      series: p.card.set.series,
      currentPrice: p.card.price?.cardmarketPrice || null,
      pokemon: {
        id: p.card.pokemon.id,
        name: p.card.pokemon.nameFr,
      },
    },
  }));

   return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      <DashboardHeader
        userName={session.user.name || ''}
        userEmail={session.user.email || ''}
        pinnedCount={formattedPins.length}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <DashboardClient initialPins={formattedPins} />
      </main>
    </div>
  );
}