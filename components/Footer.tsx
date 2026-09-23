export default function Footer() {
  return (
    <footer className="border-t border-red-500/10 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
      <p>
        Données et images de cartes :{' '}
        <a href="https://tcgdex.dev" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline underline-offset-2">
          TCGdex
        </a>
        {' · '}Prix indicatifs issus de Cardmarket, sans garantie.
      </p>
      <p className="mt-1">
        Site de fan non officiel. Pokémon et les noms associés sont des marques de Nintendo,
        Creatures Inc. et GAME FREAK inc.
      </p>
    </footer>
  );
}
