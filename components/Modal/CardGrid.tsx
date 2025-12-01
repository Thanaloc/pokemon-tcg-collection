import React from 'react';
import type { Card } from '@/types';
import CardItem from './CardItem';

interface Props {
  cards: Card[];
  cardsWithMultipleRarities: Set<string>;
  collectionEnabled: boolean;
}

export default function CardGrid({ cards, cardsWithMultipleRarities, collectionEnabled }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map(card => (
        <CardItem 
          key={card.id} 
          card={card} 
          hasPriceWarning={cardsWithMultipleRarities.has(card.id)} 
          collectionEnabled={collectionEnabled} 
        />
      ))}
    </div>
  );
}