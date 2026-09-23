'use client';

import CardRail, { type RailCard } from './CardRail';
import PokemonArt from '@/components/ui/PokemonArt';
import TypeBadge from '@/components/ui/TypeBadge';
import { typeColor, typesOf } from '@/constants/types';

export interface PokemonOfTheDayData {
  id: number;
  name: string;
  totalCards: number;
  cards: RailCard[];
}

interface Props {
  data: PokemonOfTheDayData;
  onOpen: (pokemonId: number) => void;
}

export default function PokemonOfTheDay({ data, onOpen }: Props) {
  const types = typesOf(data.id);
  const color = typeColor(types[0]);

  return (
    <section
      className="rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col lg:flex-row gap-5"
      style={{ backgroundImage: `linear-gradient(110deg, ${color}33, transparent 55%)` }}
    >
      <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:w-56 shrink-0">
        <PokemonArt id={data.id} className="w-24 h-24 lg:w-36 lg:h-36 drop-shadow-xl" />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Pokémon du jour</p>
          <h2 className="text-2xl font-bold text-white truncate">{data.name}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {types.map(type => <TypeBadge key={type} type={type} />)}
          </div>
          <button
            onClick={() => onOpen(data.id)}
            className="mt-3 rounded-md bg-white/10 hover:bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition active:scale-[0.97]"
          >
            Voir ses {data.totalCards} cartes
          </button>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <CardRail cards={data.cards} onSelect={onOpen} />
      </div>
    </section>
  );
}
