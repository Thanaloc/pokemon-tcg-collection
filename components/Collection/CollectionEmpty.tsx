import Link from 'next/link';

export default function CollectionEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 p-10 text-center">
      <p className="text-white font-medium">Votre collection est vide</p>
      <p className="text-slate-400 text-sm mt-1 mb-5">
        Ouvrez un Pokémon et ajoutez les cartes que vous possédez.
      </p>
      <Link
        href="/"
        className="inline-block px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
      >
        Parcourir les Pokémon
      </Link>
    </div>
  );
}
