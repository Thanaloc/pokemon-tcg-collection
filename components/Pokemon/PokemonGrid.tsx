import React from 'react';
import type { Pokemon } from '@/types';
import PokemonItem from './PokemonItem';

interface Props {
  items: Pokemon[];
  onSelect: (p: Pokemon) => void;
}

export default function PokemonGrid({ items, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
      {items.map(p => (
        <PokemonItem key={p.id} pokemon={p} onSelect={onSelect} />
      ))}
    </div>
  );
}
