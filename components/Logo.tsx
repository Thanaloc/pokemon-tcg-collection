import Link from 'next/link';

/** Static Poké Ball mark + site name. */
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-white shrink-0" aria-label="Accueil">
      <svg viewBox="0 0 32 32" className="w-7 h-7" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#f1f5f9" />
        <path d="M2 16a14 14 0 0 1 28 0Z" fill="#dc2626" />
        <path d="M2 16h28" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="4.5" fill="#f1f5f9" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="14" fill="none" stroke="#0f172a" strokeWidth="2" />
      </svg>
      <span className="font-semibold tracking-tight hidden sm:inline">Pokémon TCG Collection</span>
    </Link>
  );
}
