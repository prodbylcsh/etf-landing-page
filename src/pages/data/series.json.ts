// Měsíční řady pro „Stroj času“ – načítají se líně až při otevření kalkulačky (menší HTML).
import type { APIRoute } from 'astro';
import { fx, series, pricesAsOf } from '../../lib/market';
import { MACHINE_TICKERS } from '../../lib/config';

export const GET: APIRoute = () => {
  const pick = Object.fromEntries(MACHINE_TICKERS.map((t) => [t.ticker, series[t.ticker] ?? []]));
  return new Response(JSON.stringify({ fx: fx.monthly, series: pick, asOf: pricesAsOf }), {
    headers: { 'content-type': 'application/json' },
  });
};
