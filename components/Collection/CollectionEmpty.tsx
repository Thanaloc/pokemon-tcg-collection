import Link from 'next/link';

export default function CollectionEmpty() {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-red-500/20">
      <p className="text-red-200/80 text-lg mb-2">Votre collection est vide</p>
      <p className="text-slate-400 text-sm mb-6">
        Explorez les Pokémon et ajoutez des cartes à votre collection !
      </p>
      <Link 
        href="/" 
        className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-lg transition-all"
      >
        Explorer les Pokémon
      </Link>
    </div>
  );
}