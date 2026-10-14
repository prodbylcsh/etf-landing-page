// POST /api/lead – přijme e-mail, uloží lead (Supabase), pošle tahák (Brevo), nahlásí konverzi (Meta CAPI).
// Bez nastavených klíčů běží v mock režimu: validuje, zaloguje a vrátí { ok: true, mock: true }.
import type { APIRoute } from 'astro';
import { saveLead } from '../../lib/server/supabase';
import { deliverTahak } from '../../lib/server/brevo';
import { sendMetaLead } from '../../lib/server/meta';
import { etfByTicker } from '../../lib/market';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const hits = new Map<string, number[]>(); // jednoduchý rate limit v rámci instance

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');

export const POST: APIRoute = async ({ request, clientAddress, site }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Neplatný požadavek.' });
  }

  // Honeypot / příliš rychlé odeslání → tvaříme se úspěšně, ale nic neukládáme.
  if (str(body.company) || Number(body.elapsedMs) < 1500) return json(200, { ok: true });

  const email = str(body.email, 254).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json(422, { ok: false, error: 'Zkontrolujte prosím e-mail, něco v něm chybí.' });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 5) return json(429, { ok: false, error: 'Příliš mnoho pokusů. Zkuste to prosím za minutu.' });
  hits.set(ip, [...recent, now]);

  const ctx = body.context && typeof body.context === 'object' ? body.context : {};
  const tickers = Array.isArray(ctx.tickers) ? ctx.tickers.filter((t: unknown) => typeof t === 'string' && etfByTicker[t]).slice(0, 3) : [];
  const result = ctx.result && typeof ctx.result === 'object' ? ctx.result : null;
  const variant = body.variant === 'poplatky' ? 'poplatky' : 'dvojce';
  const marketing = body.marketing === true;
  const eventId = str(body.eventId, 64) || crypto.randomUUID();
  const utm = Object.fromEntries(Object.entries(body.utm ?? {}).filter(([k, v]) => /^(utm_\w+|fbclid)$/.test(k) && typeof v === 'string').map(([k, v]) => [k, str(v)]));
  const siteUrl = (site ?? new URL(request.url)).toString();

  try {
    const [db, mail] = await Promise.all([
      saveLead({
        email,
        marketing_consent: marketing,
        variant,
        placement: str(body.placement, 60),
        source: str(ctx.source, 60) || null,
        tickers: tickers.length ? tickers : null,
        result,
        utm,
        time_on_page_ms: Number.isFinite(body.timeOnPageMs) ? Math.round(body.timeOnPageMs) : null,
        user_agent: request.headers.get('user-agent'),
        event_id: eventId,
      }),
      deliverTahak({ email, marketing, variant, tickers, result, siteUrl }),
    ]);
    // Meta CAPI jen se souhlasem s marketingovými cookies (posílá hash e-mailu).
    if (body.adConsent === true) {
      const cookies = request.headers.get('cookie') ?? '';
      const cookie = (n: string) => cookies.match(new RegExp(`${n}=([^;]+)`))?.[1] ?? null;
      await sendMetaLead({ email, eventId, url: str(body.page, 500), ip, ua: request.headers.get('user-agent'), fbc: cookie('_fbc'), fbp: cookie('_fbp') }).catch((e) => console.warn('[meta]', e));
    }
    return json(200, { ok: true, mock: db.mock || mail.mock });
  } catch (err) {
    console.error('[lead] error', err);
    return json(500, { ok: false, error: 'Odeslání se nepovedlo. Zkuste to prosím znovu.' });
  }
};
