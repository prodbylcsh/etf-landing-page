// Měsíční řady všech ETF + kurzy ČNB pro graf „Kdybyste před N lety…“. Načítá se líně až u grafu.
import type { APIRoute } from 'astro';
import { fx, series, pricesAsOf } from '../../lib/market';

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ fx: fx.monthly, series, asOf: pricesAsOf }), {
    headers: { 'content-type': 'application/json' },
  });
