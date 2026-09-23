'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut, User, Settings, TrendingUp, Library, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const itemClass = 'w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2.5';

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
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <User size={16} />
        <span className="hidden md:inline max-w-40 truncate">{user.name || user.email}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 mt-2 w-60 bg-slate-900 rounded-lg shadow-lg border border-slate-800 py-1 z-50">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs text-slate-500">Connecté en tant que</p>
            <p className="text-sm text-white truncate">{user.email}</p>
          </div>

          {/* The header hides these buttons on small screens. */}
          <div className="lg:hidden border-b border-slate-800">
            <Link href="/collection" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
              <Library size={16} />
              <span>Ma collection</span>
            </Link>
            <Link href="/dashboard" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
              <TrendingUp size={16} />
              <span>Suivi des prix</span>
            </Link>
          </div>

          <Link href="/account" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
            <Settings size={16} />
            <span>Mon compte</span>
          </Link>

          <button onClick={handleSignOut} role="menuitem" className={itemClass}>
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
}
