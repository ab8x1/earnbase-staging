// helpers
const STOP_WORDS = new Set(['on', 'the', 'a', 'an', 'of', 'and']);
const ALIASES: Record<string, string[]> = {
  eth: ['ethereum'],
  usdc: ['usd-coin', 'usdcoin'],
  arb: ['arbitrum'],
  base: [],
};

const normalize = (s: unknown): string => {
  if (typeof s !== 'string') return ''; // ensure string input

  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s]/g, ' ') // drop punctuation
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
};

export const tokenize = (s: string) =>
  normalize(s)
    .split(' ')
    .filter(t => t && !STOP_WORDS.has(t));

// returns true if every token (or any of its aliases) is found in hay
export const tokensMatch = (tokens: string[], hay: string) => {
  const hayNorm = normalize(hay);
  return tokens.every(t => {
    if (hayNorm.includes(t)) return true;
    const aliases = ALIASES[t] || [];
    return aliases.some(a => hayNorm.includes(a));
  });
};
