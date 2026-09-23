'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut, User, Settings, TrendingUp, Library } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const itemClass = 'w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-2';

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Menu du compte"
        className="group flex items-center gap-2
                 bg-slate-800/90 hover:bg-slate-700/90
                 text-white px-3 sm:px-5 py-2.5 rounded-xl
                 border-2 border-slate-600/50 hover:border-slate-500/60
                 transition-all duration-200
                 transform hover:scale-105
                 shadow-lg hover:shadow-xl"
      >
        <div className="relative">
          <User size={20} className="group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <span className="font-medium hidden md:inline max-w-40 truncate">{user.name || user.email}</span>

        {/* Small indicator dot */}
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"></div>
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 mt-2 w-60 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm text-slate-400">Connecté en tant que</p>
            <p className="text-white font-medium truncate">{user.email}</p>
          </div>

          {/* The header hides these buttons on small screens. */}
          <div className="lg:hidden border-b border-slate-700">
            <Link href="/collection" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
              <Library size={18} />
              <span>Ma collection</span>
            </Link>
            <Link href="/dashboard" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
              <TrendingUp size={18} />
              <span>Dashboard</span>
            </Link>
          </div>

          <Link href="/account" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
            <Settings size={18} />
            <span>Mon compte</span>
          </Link>

          <button onClick={handleSignOut} role="menuitem" className={itemClass}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
}
