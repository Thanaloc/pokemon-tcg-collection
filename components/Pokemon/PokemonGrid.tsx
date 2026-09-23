import React from 'react';
import type { Pokemon } from '@/types';
import PokemonItem from './PokemonItem';

interface Props {
  items: Pokemon[];
  onSelect: (p: Pokemon) => void;
}

export default function PokemonGrid({ items, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map(p => (
        <PokemonItem key={p.id} pokemon={p} onSelect={onSelect} />
      ))}
    </div>
  );
}
