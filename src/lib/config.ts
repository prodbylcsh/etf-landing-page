// Konstanty stránky (jedno místo pro úpravy).
export const MACHINE_TICKERS = [
  { ticker: 'SPY', label: 'S&P 500' },
  { ticker: 'VT', label: 'celý svět' },
  { ticker: 'SCHD', label: 'dividendy' },
  { ticker: 'GLD', label: 'zlato' },
];

export const HERO_TICKERS = ['VOO', 'SPY', 'SCHD', 'VT', 'VTI', 'GLD'];
export const COMPARE_INITIAL = ['VOO', 'SPY', 'IVV'];

/** Předpoklad hrubého ročního výnosu pro kalkulačku poplatků (nastavitelný v UI). */
export const GROSS_RETURN = 0.07;
export const HERO_YEARS = 25;

export const PDF_URL = '/bestbrookies-etf-tahak-2026.pdf';
export const BRAND = {
  name: 'BestBrookies',
  legal: 'BestBrookies s.r.o. (fiktivní subjekt pro účely konceptu)',
  ico: '00000000',
  email: 'ahoj@bestbrookies.cz',
};
