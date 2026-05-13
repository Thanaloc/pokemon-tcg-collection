const CARDMARKET_SEARCH = 'https://www.cardmarket.com/fr/Pokemon/Products/Search';

interface CardForCardmarket {
  name: string;
  number: string;
}

function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function buildCardmarketUrl({ name, number }: CardForCardmarket): string {
  const cleanNumber = number.split('/')[0];  
  const cleanName = stripAccents(name);      

  const query = `${cleanName} ${cleanNumber}`.trim();
    const params = new URLSearchParams({
    searchString: query,
    language: '2',
  });
  return `${CARDMARKET_SEARCH}?${params.toString()}`;
}