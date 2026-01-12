import Link from 'next/link';
import UserMenu from '@/components/Header/UserMenu';

interface Props {
  userName: string;
  userEmail: string;
  totalCards: number;
  totalValue: number;
}

export default function CollectionHeader({ userName, userEmail, totalCards, totalValue }: Props) {
  return (
    <header className="sticky top-0 z-40 px-6 py-8 border-b border-red-500/20 bg-gradient-to-r from-slate-900/95 via-red-900/40 to-slate-900/95 backdrop-blur-xl shadow-2xl">
      
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
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            
            <Link href="/" className="relative w-14 h-14 flex-shrink-0">
              <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-red-500 via-white to-red-500 opacity-80"></div>
              <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg"></div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full border-2 border-slate-900 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            </Link>

            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 drop-shadow-lg">
                Ma Collection
              </h1>
              <p className="text-sm text-red-200/80 mt-1 font-medium">
                <strong className="text-white">{totalCards}</strong> cartes • <strong className="text-white">{totalValue.toFixed(2)}€</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 px-6 py-3 rounded-2xl border border-red-400/20">
                <p className="text-xs text-red-300 font-medium uppercase tracking-wide">Cartes</p>
                <p className="text-2xl font-extrabold text-white">{totalCards}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 px-6 py-3 rounded-2xl border border-orange-400/20">
                <p className="text-xs text-orange-300 font-medium uppercase tracking-wide">Valeur</p>
                <p className="text-2xl font-extrabold text-white">{totalValue.toFixed(2)}€</p>
              </div>
            </div>
            <UserMenu user={{ name: userName, email: userEmail }} />
          </div>
        </div>
      </div>
    </header>
  );
}