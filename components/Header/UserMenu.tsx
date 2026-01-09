'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <User size={20} />
        <span className="font-medium">{user.name || user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-10">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm text-slate-400">Connecté en tant que</p>
            <p className="text-white font-medium truncate">{user.email}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
}