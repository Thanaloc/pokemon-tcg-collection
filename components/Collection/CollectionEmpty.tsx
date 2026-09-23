import Link from 'next/link';
import PokemonArt from '@/components/ui/PokemonArt';

export default function CollectionEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center">
      <PokemonArt id={143} className="w-32 h-32 mx-auto mb-3" />
      <p className="font-display text-lg font-semibold text-white">Votre collection dort encore</p>
      <p className="text-slate-400 text-sm mt-1 mb-5">
        Ouvrez un Pokémon et ajoutez les cartes que vous possédez.
      </p>
      <Link
        href="/"
        className="inline-block px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition active:scale-[0.97]"
      >
        Parcourir les Pokémon
      </Link>
    </div>
  );
}
