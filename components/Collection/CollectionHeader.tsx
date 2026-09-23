import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import UserMenu from '@/components/Header/UserMenu';

interface Props {
  userName: string;
  userEmail: string;
  distinctCards: number;
  totalCopies: number;
  totalValue: number;
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

export default function CollectionHeader({ userName, userEmail, distinctCards, totalCopies, totalValue }: Props) {
  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 py-4 sm:py-8 border-b border-red-500/20 bg-gradient-to-r from-slate-900/95 via-red-900/40 to-slate-900/95 backdrop-blur-xl shadow-2xl">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60V20z' fill='none' stroke='%23ef4444' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: "70px 70px",
          maskImage: "linear-gradient(to bottom, transparent, black, black, transparent)"
        }}></div>

        <div className="absolute -top-20 -left-28 w-80 h-80 bg-red-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute top-32 right-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">

            <Link href="/" aria-label="Accueil" className="relative w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0">
              <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-red-500 via-white to-red-500 opacity-80"></div>
              <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
                <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg"></div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-slate-900 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            </Link>

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 drop-shadow-lg">
                Ma Collection
              </h1>
              <p className="text-xs sm:text-sm text-red-200/80 mt-1 font-medium truncate">
                <strong className="text-white">{distinctCards}</strong> carte{distinctCards > 1 ? 's' : ''}
                {' • '}<strong className="text-white">{totalCopies}</strong> exemplaire{totalCopies > 1 ? 's' : ''}
                {' • '}<strong className="text-white">{euros.format(totalValue)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden lg:flex gap-4 items-center">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 px-6 py-3 rounded-2xl border border-red-400/20">
                <p className="text-xs text-red-300 font-medium uppercase tracking-wide">Exemplaires</p>
                <p className="text-2xl font-extrabold text-white">{totalCopies}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 px-6 py-3 rounded-2xl border border-orange-400/20">
                <p className="text-xs text-orange-300 font-medium uppercase tracking-wide">Valeur estimée</p>
                <p className="text-2xl font-extrabold text-white">{euros.format(totalValue)}</p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="group relative px-5 py-2.5
                       bg-slate-800/90 hover:bg-slate-700/90
                       rounded-xl font-bold text-white
                       border-2 border-amber-500/40 hover:border-amber-400/60
                       shadow-lg hover:shadow-xl hover:shadow-amber-500/40
                       transition-all duration-200
                       transform hover:scale-105
                       hidden lg:flex items-center gap-3"
            >
              <TrendingUp className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span>Dashboard</span>
            </Link>

            <UserMenu user={{ name: userName, email: userEmail }} />
          </div>
        </div>
      </div>
    </header>
  );
}
