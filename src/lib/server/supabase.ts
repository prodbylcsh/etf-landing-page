// Uložení leadu do Supabase (PostgREST). Bez SUPABASE_URL běží v mock režimu.
import { env } from './env';

export interface LeadRow {
  email: string;
  marketing_consent: boolean;
  variant: string;
  placement: string;
  source: string | null;
  tickers: string[] | null;
  result: Record<string, unknown> | null;
  utm: Record<string, string>;
  time_on_page_ms: number | null;
  user_agent: string | null;
  event_id: string;
}

export async function saveLead(row: LeadRow): Promise<{ mock: boolean }> {
  const url = env('SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    console.log('[lead:mock] Supabase insert', { ...row, email: mask(row.email) });
    return { mock: true };
  }
  // Upsert podle e-mailu: opakované odeslání aktualizuje poslední kontext, nevytvoří duplicitu.
  const res = await fetch(`${url}/rest/v1/leads?on_conflict=email`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return { mock: false };
}

export const mask = (email: string) => email.replace(/^(.).*(@.*)$/, '$1***$2');
