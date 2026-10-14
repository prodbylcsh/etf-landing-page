// Brevo: kontakt do seznamu + transakční e-mail s tahákem. Bez BREVO_API_KEY běží v mock režimu.
import { env } from './env';
import { mask } from './supabase';
import { renderTahakEmail } from './email-template';

const API = 'https://api.brevo.com/v3';

async function brevo(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'api-key': env('BREVO_API_KEY')!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) throw new Error(`Brevo ${path} ${res.status}: ${await res.text()}`);
}

export interface DeliverInput {
  email: string;
  marketing: boolean;
  variant: string;
  tickers: string[];
  result: Record<string, unknown> | null;
  siteUrl: string;
}

export async function deliverTahak(input: DeliverInput): Promise<{ mock: boolean }> {
  const { subject, html, text } = renderTahakEmail(input);
  if (!env('BREVO_API_KEY')) {
    console.log('[lead:mock] Brevo send', { to: mask(input.email), subject, marketing: input.marketing, bytes: html.length });
    return { mock: true };
  }
  const listIds = [Number(env('BREVO_LIST_ID'))].filter(Boolean);
  // Do navazující série jen se souhlasem (samostatný seznam spouští automatizaci v Brevu).
  if (input.marketing && env('BREVO_NURTURE_LIST_ID')) listIds.push(Number(env('BREVO_NURTURE_LIST_ID')));
  await brevo('/contacts', {
    email: input.email,
    updateEnabled: true,
    listIds,
    attributes: { VARIANT: input.variant, TICKERS: input.tickers.join(','), MARKETING: input.marketing },
  });
  await brevo('/smtp/email', {
    sender: { name: 'BestBrookies', email: env('BREVO_SENDER_EMAIL') ?? 'tahak@bestbrookies.cz' },
    to: [{ email: input.email }],
    subject,
    htmlContent: html,
    textContent: text,
    tags: ['tahak', input.variant],
  });
  return { mock: false };
}
