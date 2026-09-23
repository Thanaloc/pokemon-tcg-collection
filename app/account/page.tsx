import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 mb-2">
          Mon compte
        </h1>
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
