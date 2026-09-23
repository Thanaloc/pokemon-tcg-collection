interface PokemonNames {
  id: number;
  nameFr: string;
  nameEn: string;
}

export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves a TCGdex card to a Pokédex number: first through `dexId`, then by
 * exact name match on the longest run of words in the card name, so
 * "Mewtwo ex de la Team Rocket" → Mewtwo and "M. Mime" → M. Mime (not Mime Jr.).
 * No substring matching: a wrong Pokémon is worse than a skipped card.
 */
export function createPokemonMatcher(pokemon: PokemonNames[]) {
  const knownIds = new Set(pokemon.map(p => p.id));
  const byName = new Map<string, number>();
  for (const p of pokemon) {
    for (const name of [p.nameFr, p.nameEn]) {
      const key = normalizeName(name);
      if (key && !byName.has(key)) byName.set(key, p.id);
    }
  }

  return function match(card: { name?: string; dexId?: number[] }): number | null {
    for (const dexId of card.dexId ?? []) {
      if (knownIds.has(dexId)) return dexId;
    }

    if (!card.name) return null;
    const words = card.name.split(/[\s-]+/).filter(Boolean);
    for (let length = words.length; length > 0; length--) {
      for (let start = 0; start + length <= words.length; start++) {
        const id = byName.get(normalizeName(words.slice(start, start + length).join('')));
        if (id !== undefined) return id;
      }
    }
    return null;
  };
}
