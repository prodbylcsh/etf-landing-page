-- BestBrookies: leady z landing page.
-- Zápis probíhá výhradně ze serveru (/api/lead) přes service role klíč; RLS blokuje anonymní přístup.

create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  email            text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  marketing_consent boolean not null default false,
  variant          text not null check (variant in ('dvojce', 'poplatky')),
  placement        text,          -- hero | sheet_compare_lock | tahak | final | …
  source           text,          -- poslední interakce před odesláním (compare_lock, calc_fees…)
  tickers          text[],
  result           jsonb,         -- výsledek kalkulačky (personalizace e-mailu)
  utm              jsonb not null default '{}'::jsonb,
  time_on_page_ms  integer,
  user_agent       text,
  event_id         text,          -- deduplikace s Meta Pixel / CAPI
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_variant_idx on public.leads (variant);

alter table public.leads enable row level security;
-- Žádné politiky pro anon/authenticated = žádný přístup z klienta. Service role RLS obchází.

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();

-- Přehled konverzí podle varianty a zdroje (pro rychlou kontrolu bez PostHogu).
create or replace view public.leads_daily with (security_invoker = true) as
select date_trunc('day', created_at) as day, variant, coalesce(utm->>'utm_content', '(none)') as creative,
       source, count(*) as leads, count(*) filter (where marketing_consent) as with_consent
from public.leads group by 1, 2, 3, 4 order by 1 desc;
