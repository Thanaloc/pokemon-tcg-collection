import { redirect } from 'next/navigation';
import SiteNav from '@/components/Header/SiteNav';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import AccountClient from './AccountClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mon compte — Pokémon TCG Collection' };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/account');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      createdAt: true,
      _count: { select: { collections: true, pinnedCards: true } },
    },
  });
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Mon compte</h1>
        <p className="text-slate-400 text-sm mb-8">
          Membre depuis le {user.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{user._count.collections} carte{user._count.collections > 1 ? 's' : ''} en collection
          {' · '}{user._count.pinnedCards} suivie{user._count.pinnedCards > 1 ? 's' : ''}
        </p>

        <AccountClient email={user.email} initialName={user.name ?? ''} />
      </main>
    </div>
  );
}
