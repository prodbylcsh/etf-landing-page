// Spojení ručně kurátorovaných údajů (universe.json) s automaticky staženými daty (market.json).
import universe from '../data/universe.json';
import marketRaw from '../data/market.json';

type Raw = any;
const market: Raw = marketRaw;

export type Policy = 'acc' | 'dist';

export interface Twin {
  name: string;
  ticker: string | null;
  isin: string;
  ter: number;
  policy: Policy;
  replication: string;
  match: 'exact' | 'closest';
  note: string;
  sourceUrl: string;
  free?: boolean;
}

export interface Etf {
  ticker: string;
  nameCz: string;
  issuer: string;
  category: string;
  categoryCz: string;
  pitch: string;
  issuerUrl: string;
  exchange: string | null;
  ter: number | null;
  netAssets: number | null;
  dividendYield: number | null;
  inception: string | null;
  returns: { y1: number | null; y5: number | null; y10: number | null; y20: number | null; asOf: string | null };
  lastPrice: number | null;
  firstMonth: string | null;
  topHoldings: { symbol: string; name: string; weight: number | null }[];
  profileAsOf: string | null;
  twin: Twin;
}

export const etfs: Etf[] = universe.etfs.map((u: Raw) => {
  const m = market.etfs?.[u.ticker] ?? {};
  const p = m.profile ?? {};
  return {
    ticker: u.ticker,
    nameCz: u.nameCz,
    issuer: u.issuer,
    category: u.category,
    categoryCz: u.categoryCz,
    pitch: u.pitch,
    issuerUrl: u.issuerUrl,
    exchange: market.listing?.exchanges?.[u.ticker] ?? null,
    ter: p.ter ?? null,
    netAssets: p.netAssets ?? null,
    dividendYield: p.dividendYield ?? null,
    inception: p.inception ?? null,
    returns: {
      y1: m.returns?.y1 ?? null,
      y5: m.returns?.y5 ?? null,
      y10: m.returns?.y10 ?? null,
      y20: m.returns?.y20 ?? null,
      asOf: m.returns?.asOf ?? null,
    },
    lastPrice: m.lastPrice?.close ?? null,
    firstMonth: m.monthly?.[0]?.[0] ?? null,
    topHoldings: p.holdings ?? [],
    profileAsOf: p.asOf ?? null,
    twin: u.twin as Twin,
  };
});

export const etfByTicker = Object.fromEntries(etfs.map((e) => [e.ticker, e]));

export const series: Record<string, [string, number][]> = Object.fromEntries(
  Object.entries(market.etfs ?? {}).map(([t, v]: [string, Raw]) => [t, v.monthly ?? []]),
);

export const fx = {
  usdczk: (market.fx?.usdczk as number) ?? 22,
  date: (market.fx?.date as string) ?? null,
  monthly: (market.fx?.monthly as Record<string, number>) ?? {},
};

export const listing = {
  nyseEtfCount: (market.listing?.nyseEtfCount as number) ?? null,
  asOf: (market.listing?.asOf as string) ?? null,
};

export const tickerFeed = {
  avgDailyUsd: (market.ticker?.avgDailyUsd as number) ?? 0,
  etfCount: (market.ticker?.etfCount as number) ?? 0,
  sessionSeconds: 23400,
  method: (market.ticker?.method as string) ?? '',
};

export const dataComplete = Boolean(market.complete);
export const generatedAt: string | null = market.generatedAt ?? null;
export const twinsVerifiedAt: string = universe.twinsVerifiedAt;
export const czechFund = universe.benchmarks.czechFundTer;

/** Nejlevnější TER mezi evropskými dvojčaty S&P 500 – použije se v kalkulačce. */
export const cheapTwinTer = Math.min(...etfs.filter((e) => e.category === 'sp500').map((e) => e.twin.ter));

export const pricesAsOf: string | null = etfs.map((e) => e.returns.asOf).filter(Boolean).sort().at(-1) ?? null;

/** Kompaktní data pro klientské komponenty (bez měsíčních řad). */
export const etfsLite = etfs.map(({ topHoldings, issuerUrl, ...rest }) => ({ ...rest, topHolding: topHoldings[0]?.name ?? null }));
export type EtfLite = (typeof etfsLite)[number];
