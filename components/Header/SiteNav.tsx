'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Logo from '@/components/Logo';
import UserMenu from './UserMenu';

const LINKS = [
  { href: '/collection', label: 'Ma collection' },
  { href: '/dashboard', label: 'Suivi des prix' },
];

/** Top bar shared by every page. */
export default function SiteNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          {session?.user && (
            <nav className="hidden lg:flex items-center gap-1">
              {LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'text-white bg-slate-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {session?.user ? (
          <UserMenu user={session.user} />
        ) : status === 'loading' ? null : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-600 hover:bg-red-500 text-white transition active:scale-[0.97]">
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
