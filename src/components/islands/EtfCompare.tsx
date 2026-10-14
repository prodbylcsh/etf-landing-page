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
      return `Všechna sledují stejný trh (${list[0].categoryCz}). Liší se hlavně poplatkem: ${hi.ticker} je ${ratio >= 1.95 ? `${(Math.round(ratio * 10) / 10).toLocaleString('cs-CZ')}× dražší` : 'dražší'} než ${lo.ticker}. A žádné z nich si u českého brokera nekoupíte.`;
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

      <div class="mt-4 overflow-hidden rounded-2xl bg-[var(--color-card)] ring-1 ring-[var(--color-rule)]">
        {/* Hlavička: tickery vedle sebe */}
        <div class="grid grid-cols-[var(--c-sm)] md:grid-cols-[var(--c-md)] border-b-[1.5px] border-[var(--color-ink)] px-3 pt-4 pb-3 md:px-5" style={cols(list.length)}>
          <span class="hidden md:block" />
          {list.map((e) => (
            <div key={e.ticker} class="animate-rise min-w-0">
              <h3 class="num text-[1.55rem] leading-none font-bold md:text-[2rem]">{e.ticker}</h3>
              <p class="mt-1 truncate text-[12px] leading-tight text-[var(--color-muted)] md:text-[13.5px]">{e.issuer}</p>
              <span class="stamp mt-2 !text-[9px]">v ČR ne</span>
            </div>
          ))}
        </div>
        <dl class="px-3 md:px-5">
          {ROWS.map((r) => {
            const vals = list.map((e) => r.get(e));
            const best = r.best ? bestIndex(vals, r.best) : -1;
            return (
              <div class="grid grid-cols-[var(--c-sm)] md:grid-cols-[var(--c-md)] items-baseline gap-y-1 border-b border-[var(--color-rule)] py-2.5" style={cols(list.length)}>
                <dt class="col-span-full text-[12.5px] text-[var(--color-muted)] md:col-span-1 md:text-[14px]">{r.label}</dt>
                {list.map((e, i) => (
                  <dd class={`num text-[15px] md:text-[16px] ${i === best ? 'font-bold text-[var(--color-up)]' : 'font-medium'} ${r.tone ? toneClass(vals[i]) : ''}`}>
                    {r.fmt(vals[i])}
                    {i === best && <span class="sr-only"> (nejlepší)</span>}
                  </dd>
                ))}
              </div>
            );
          })}
          <div class="grid grid-cols-[var(--c-sm)] md:grid-cols-[var(--c-md)] items-baseline gap-y-1 py-2.5" style={cols(list.length)}>
            <dt class="col-span-full text-[12.5px] text-[var(--color-muted)] md:col-span-1 md:text-[14px]">Koupíte u evropského brokera? (PRIIPs)</dt>
            {list.map(() => (
              <dd class="num text-[15px] font-bold text-[var(--color-stamp)]">✕ ne</dd>
            ))}
          </div>
        </dl>

        {/* Dvojčata */}
        <div class="terminal m-2 p-3.5 md:m-3 md:p-5">
          <p class="kicker !text-[var(--color-phosphor)]">Co koupit místo nich · evropská dvojčata</p>
          <ul class="mt-2 divide-y divide-[var(--color-term-line)]">
            {list.map((e) => {
              const open = unlocked || e.twin.free;
              return (
                <li key={e.ticker} class="py-2.5">
                  <div class="flex items-baseline gap-2">
                    <span class="num w-12 shrink-0 text-[13px] text-[#9db0a7]">{e.ticker} →</span>
                    {open ? (
                      <div class="animate-rise min-w-0">
                        <p class="text-[14.5px] leading-snug font-semibold text-white">{e.twin.name}</p>
                        <p class="num mt-0.5 text-[12.5px] text-[#b9c7c0]">
                          <span class="text-[var(--color-amber)]">{e.twin.isin}</span> · TER {ter(e.twin.ter)}
                          {e.twin.ticker && <> · {e.twin.ticker}</>}
                        </p>
                        <p class="mt-1 text-[12px] leading-snug text-[#8fa39a]">
                          {e.twin.match === 'closest' && 'Nejbližší alternativa. '}
                          {e.twin.note}{' '}
                          <a href={e.twin.sourceUrl} target="_blank" rel="noopener nofollow" class="underline underline-offset-2">
                            zdroj
                          </a>
                        </p>
                      </div>
                    ) : (
                      <button type="button" class="min-w-0 flex-1 text-left" onClick={() => unlock(e)} data-track="compare_lock" aria-label={`Odemknout dvojče k ${e.ticker}`}>
                        <span class="locked-blur block text-[14.5px] font-semibold text-white" aria-hidden="true">
                          Xxxxxxx Xxxx XXX UCITS ETF
                        </span>
                        <span class="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--color-amber)]">🔒 Odemknout dvojče</span>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {!unlocked && (
            <button
              type="button"
              class="btn mt-2 w-full bg-[var(--color-amber)] text-[var(--color-term)]"
              data-track="compare_unlock_all"
              onClick={() => {
                track('lock_click', { where: 'compare_all' });
                openLead({ source: 'compare_lock', tickers: sel, headline: 'Všech 12 dvojčat s ISIN vám pošleme do e-mailu' });
              }}
            >
              🔒 Odemknout všech 12 dvojčat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobil: hodnoty ve sloupcích pod popiskem. Desktop: popisek vlevo + sloupce.
const cols = (n: number) => ({ '--c-sm': `repeat(${n}, minmax(0, 1fr))`, '--c-md': `minmax(180px, 1.1fr) repeat(${n}, minmax(0, 1fr))` }) as any;

interface RowDef {
  label: string;
  get: (e: EtfLite) => number | null;
  fmt: (v: number | null) => string;
  best?: 'min' | 'max';
  tone?: boolean;
}

const ROWS: RowDef[] = [
  { label: 'Poplatek (TER) ročně', get: (e) => e.ter, fmt: ter, best: 'min' },
  { label: 'Z 100 000 Kč zaplatíte ročně', get: (e) => (e.ter != null ? e.ter * 100000 : null), fmt: (v) => (v == null ? '—' : czk(v)), best: 'min' },
  { label: 'Výnos za 1 rok (USD)', get: (e) => e.returns.y1, fmt: (v) => pct(v, 1, true), tone: true },
  { label: 'Výnos 5 let, ročně', get: (e) => e.returns.y5, fmt: (v) => pct(v, 1, true), tone: true },
  { label: 'Výnos 10 let, ročně', get: (e) => e.returns.y10, fmt: (v) => pct(v, 1, true), tone: true },
  { label: 'Dividendový výnos', get: (e) => e.dividendYield, fmt: (v) => pct(v, 2) },
  { label: 'Spravovaný majetek (USD)', get: (e) => e.netAssets, fmt: (v) => (v ? usdShort(v).replace(/\s?USD$/, '') : '—') },
];

function bestIndex(vals: (number | null)[], mode: 'min' | 'max') {
  const valid = vals.map((v, i) => [v, i] as const).filter(([v]) => v != null) as [number, number][];
  if (valid.length < 2) return -1;
  const sorted = valid.sort((a, b) => (mode === 'min' ? a[0] - b[0] : b[0] - a[0]));
  return sorted[0][0] === sorted[1][0] ? -1 : sorted[0][1];
}

const toneClass = (v: number | null) => (v == null ? '' : v >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]');
