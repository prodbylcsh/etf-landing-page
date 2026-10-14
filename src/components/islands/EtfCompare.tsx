// Srovnání („souboj“) až 3 ETF z NYSE + jejich evropská dvojčata. Hlavní brána ke kontaktu (zámky).
import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $context, $unlocked, openLead } from '../../lib/store';
import { track } from '../../lib/track';
import { czk, pct, ter, usdShort } from '../../lib/format';
import type { EtfLite } from '../../lib/market';

interface Props {
  etfs: EtfLite[];
  initial: string[];
}

const MAX = 3;

function insight(list: EtfLite[]): string | null {
  if (list.length < 2) return null;
  const withTer = list.filter((e) => e.ter != null);
  const byTer = [...withTer].sort((a, b) => a.ter! - b.ter!);
  const cats = new Set(list.map((e) => e.category));
  if (cats.size === 1 && byTer.length >= 2) {
    const lo = byTer[0];
    const hi = byTer[byTer.length - 1];
    if (hi.ter! > lo.ter!) {
      const ratio = hi.ter! / lo.ter!;
      return `Všechna sledují stejný trh (${list[0].categoryCz}). Liší se hlavně poplatkem: ${hi.ticker} je ${ratio >= 1.95 ? `${Math.round(ratio * 10) / 10}× dražší` : 'dražší'} než ${lo.ticker}. A žádné z nich si u českého brokera nekoupíte.`;
    }
    return `Všechna sledují stejný trh (${list[0].categoryCz}) se stejným poplatkem. A žádné z nich si u českého brokera nekoupíte.`;
  }
  const best10 = [...list].filter((e) => e.returns.y10 != null).sort((a, b) => b.returns.y10! - a.returns.y10!)[0];
  const parts = [];
  if (byTer[0]) parts.push(`Nejlevnější je ${byTer[0].ticker} (${ter(byTer[0].ter)} ročně)`);
  if (best10) parts.push(`nejvíc za 10 let vydělalo ${best10.ticker} (${pct(best10.returns.y10, 1)} ročně)`);
  return parts.length ? parts.join(', ') + '. Minulé výnosy ale nejsou zárukou budoucích.' : null;
}

export default function EtfCompare({ etfs, initial }: Props) {
  const [sel, setSel] = useState<string[]>(initial);
  const unlocked = useStore($unlocked);
  const list = sel.map((t) => etfs.find((e) => e.ticker === t)!).filter(Boolean);
  const note = insight(list);

  function toggle(t: string) {
    let next: string[];
    if (sel.includes(t)) next = sel.length > 1 ? sel.filter((x) => x !== t) : sel;
    else next = sel.length >= MAX ? [...sel.slice(1), t] : [...sel, t];
    setSel(next);
    $context.set({ ...$context.get(), tickers: next });
    track('compare_change', { tickers: next.join(',') });
  }

  function unlock(e: EtfLite) {
    track('lock_click', { where: 'compare', ticker: e.ticker });
    openLead({ source: 'compare_lock', tickers: sel, headline: `Dvojče k ${e.ticker} a dalším 11 ETF vám pošleme do e-mailu` });
  }

  return (
    <div>
      <p class="kicker">Vyberte až 3 ETF ({sel.length}/3)</p>
      <div class="scroll-x -mx-4 mt-2 flex gap-2 px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Výběr ETF ke srovnání">
        {etfs.map((e) => (
          <button type="button" class="chip shrink-0" aria-pressed={sel.includes(e.ticker)} onClick={() => toggle(e.ticker)} data-track="compare_chip">
            {e.ticker}
          </button>
        ))}
      </div>

      {note && (
        <p key={sel.join()} class="animate-rise mt-4 border-l-[3px] border-[var(--color-amber)] pl-3 text-[15.5px] leading-snug font-medium">
          {note}
        </p>
      )}

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        {list.map((e) => {
          const open = unlocked || e.twin.free;
          return (
            <article key={e.ticker} class="animate-rise flex flex-col overflow-hidden rounded-2xl bg-[var(--color-card)] ring-1 ring-[var(--color-rule)]">
              <header class="flex items-start justify-between gap-2 px-4 pt-4">
                <div>
                  <h3 class="num text-[1.7rem] leading-none font-bold">{e.ticker}</h3>
                  <p class="mt-1 text-[13.5px] leading-tight text-[var(--color-muted)]">
                    {e.nameCz} · {e.issuer}
                  </p>
                </div>
                <span class="stamp shrink-0 text-[9.5px]">v ČR ne</span>
              </header>
              <p class="px-4 pt-2 text-[13.5px] leading-snug text-[var(--color-ink-2)]">{e.pitch}</p>
              <dl class="mt-3 divide-y divide-[var(--color-rule)] border-t border-[var(--color-rule)] px-4 text-[14.5px]">
                <Row k="Poplatek (TER) ročně" v={ter(e.ter)} strong />
                <Row k="Z 100 000 Kč zaplatíte ročně" v={e.ter != null ? czk(e.ter * 100000) : '—'} />
                <Row k="Výnos za 1 rok" v={pct(e.returns.y1, 1, true)} tone={e.returns.y1} />
                <Row k="Výnos 5 let (ročně)" v={pct(e.returns.y5, 1, true)} tone={e.returns.y5} />
                <Row k="Výnos 10 let (ročně)" v={pct(e.returns.y10, 1, true)} tone={e.returns.y10} />
                <Row k="Dividendový výnos" v={pct(e.dividendYield, 2)} />
                <Row k="Spravovaný majetek" v={e.netAssets ? usdShort(e.netAssets) : '—'} />
                <Row k="Koupíte v ČR?" v="Ne, chybí KID (PRIIPs)" warn />
              </dl>

              <div class="terminal m-3 mt-auto p-3.5">
                <p class="kicker !text-[var(--color-phosphor)]">
                  Evropské dvojče · {e.twin.match === 'exact' ? 'stejný index' : 'nejbližší alternativa'}
                </p>
                {open ? (
                  <div class="animate-rise">
                    <p class="mt-1.5 text-[15px] leading-tight font-semibold text-white">{e.twin.name}</p>
                    <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12.5px] text-[#b9c7c0]">
                      <div>
                        <dt class="text-[#7f948a]">Ticker</dt>
                        <dd class="num text-white">{e.twin.ticker ?? '—'}</dd>
                      </div>
                      <div>
                        <dt class="text-[#7f948a]">TER</dt>
                        <dd class="num text-white">{ter(e.twin.ter)}</dd>
                      </div>
                      <div class="col-span-2">
                        <dt class="text-[#7f948a]">ISIN (zadejte u brokera)</dt>
                        <dd class="num text-[var(--color-amber)]">{e.twin.isin}</dd>
                      </div>
                    </dl>
                    <p class="mt-2 text-[12px] leading-snug text-[#9db0a7]">
                      {e.twin.note}{' '}
                      <a href={e.twin.sourceUrl} target="_blank" rel="noopener nofollow" class="underline underline-offset-2">
                        zdroj
                      </a>
                    </p>
                  </div>
                ) : (
                  <button type="button" class="mt-1.5 block w-full text-left" onClick={() => unlock(e)} data-track="compare_lock">
                    <span class="locked-blur block text-[15px] font-semibold text-white" aria-hidden="true">
                      Xxxxxxxx Xxxx XXX UCITS ETF (Acc)
                    </span>
                    <span class="locked-blur num mt-1 block text-[12.5px] text-[var(--color-amber)]" aria-hidden="true">
                      IE00XXXXXXX0
                    </span>
                    <span class="mt-2.5 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-amber)] px-3 text-[14px] font-bold text-[var(--color-term)]">
                      🔒 Odemknout dvojče k {e.ticker}
                    </span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Row({ k, v, strong, tone, warn }: { k: string; v: string; strong?: boolean; tone?: number | null; warn?: boolean }) {
  const color = warn ? 'text-[var(--color-stamp)]' : tone == null ? '' : tone >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]';
  return (
    <div class="flex items-baseline justify-between gap-3 py-2">
      <dt class="text-[var(--color-muted)]">{k}</dt>
      <dd class={`num text-right ${strong ? 'text-[1.05rem] font-bold' : 'font-medium'} ${color}`}>{v}</dd>
    </div>
  );
}
