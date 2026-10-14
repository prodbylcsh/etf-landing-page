// Meta Conversions API – serverová událost Lead (deduplikace s Pixelem přes event_id).
import { createHash } from 'node:crypto';
import { env } from './env';

const sha = (v: string) => createHash('sha256').update(v.trim().toLowerCase()).digest('hex');

export async function sendMetaLead(opts: { email: string; eventId: string; url: string; ip?: string | null; ua?: string | null; fbc?: string | null; fbp?: string | null }) {
  const pixel = env('PUBLIC_META_PIXEL_ID');
  const token = env('META_CAPI_TOKEN');
  if (!pixel || !token) return { skipped: true };
  const res = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: opts.eventId,
          action_source: 'website',
          event_source_url: opts.url,
          user_data: { em: [sha(opts.email)], client_ip_address: opts.ip ?? undefined, client_user_agent: opts.ua ?? undefined, fbc: opts.fbc ?? undefined, fbp: opts.fbp ?? undefined },
        },
      ],
    }),
  });
  if (!res.ok) console.warn('[meta capi]', res.status, await res.text());
  return { skipped: false };
}
