// Souboj až 3 ETF: vývoj pravidelné investice v Kč (reálná data), metriky jako pruhy, evropská dvojčata se zámky.
// Barva patří ETF (ne pořadí): uvolněný slot převezme další vybrané ETF, ostatní barvu nemění.
import { useEffect, useMemo, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $context, $unlocked, openLead } from '../../lib/store';
import { track } from '../../lib/track';
import { timeMachine, type Series, type TimeMachinePoint } from '../../lib/finance';
import { czk, czkShort, pct, ter, usdShort, ymCz } from '../../lib/format';
import { useCountUp, useInView, useWidth } from '../../lib/useCountUp';
import type { EtfLite } from '../../lib/market';
import { FlagEU, IconCheck, IconLock } from '../icons';

interface Props {
  etfs: EtfLite[];
  initial: string[];
  usdczk: number;
}

const COLORS = ['var(--color-s1)', 'var(--color-s2)', 'var(--color-s3)'];
const AMOUNTS = [1000, 2000, 5000];
const BACK = [5, 10, 15];

interface Payload {
  fx: Record<string, number>;
  series: Record<string, Series>;
  asOf: string | null;
}
let cache: Promise<Payload> | null = null;
const load = () => (cache ||= fetch('/data/series.json').then((r) => r.json()));

export default function EtfCompare({ etfs, initial, usdczk }: Props) {
  const [slots, setSlots] = useState<(string | null)[]>([initial[0] ?? null, initial[1] ?? null, initial[2] ?? null]);
  const [monthly, setMonthly] = useState(2000);
  const [back, setBack] = useState(10);
  const [data, setData] = useState<Payload | null>(null);
  const unlocked = useStore($unlocked);

  useEffect(() => {
    load().then(setData, () => setData({ fx: {}, series: {}, asOf: null }));
  }, []);

  const picked = slots.map((t, i) => (t ? { etf: etfs.find((e) => e.ticker === t)!, color: COLORS[i], slot: i } : null)).filter(Boolean) as { etf: EtfLite; color: string; slot: number }[];
  const tickers = picked.map((p) => p.etf.ticker);

  function toggle(t: string) {
    const next = [...slots];
    const at = next.indexOf(t);
    if (at >= 0) {
      if (picked.length === 1) return;
      next[at] = null;
    } else {
      const free = next.indexOf(null);
      if (free >= 0) next[free] = t;
      else return; // max 3 – nejdřív odeberte
    }
    setSlots(next);
    const list = next.filter(Boolean) as string[];
    $context.set({ ...$context.get(), tickers: list });
    track('compare_change', { tickers: list.join(',') });
  }

  const lines = useMemo(() => {
    if (!data) return [];
    return picked.map((p) => {
      const s = data.series[p.etf.ticker] ?? [];
      if (!s.length) return { ...p, points: [] as TimeMachinePoint[] };
      const [y, m] = s[s.length - 1][0].split('-').map(Number);
      const start = `${y - back}-${String(m).padStart(2, '0')}`;
      return { ...p, points: timeMachine(s, data.fx, monthly, start, usdczk) };
    });
  }, [data, slots, monthly, back]);

  return (
    <div class="space-y-5">
      {/* Výběr */}
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="scroll-x -mx-5 flex gap-2 px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Vyberte až 3 ETF">
          {etfs.map((e) => {
            const i = slots.indexOf(e.ticker);
            const full = i < 0 && picked.length >= 3;
            return (
              <button type="button" class={`chip shrink-0 mono ${full ? 'opacity-40' : ''}`} aria-pressed={i >= 0} onClick={() => toggle(e.ticker)} title={full ? 'Nejdřív odeberte jedno ETF' : e.nameCz} data-track="compare_chip">
                {i >= 0 && <span class="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />}
                {e.ticker}
              </button>
            );
          })}
        </div>
        <p class="shrink-0 text-[13px] text-[var(--color-faint)]">{picked.length}/3 vybráno</p>
      </div>

      <Insight list={picked.map((p) => p.etf)} />

      <div class="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Graf */}
        <div class="card p-5 sm:p-7">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-3 text-[15px] text-[var(--color-ink-2)]">
            <span>Kdybyste před</span>
            <Seg values={BACK} value={back} fmt={(v) => `${v} lety`} onChange={(v) => (setBack(v), track('timemachine_change', { field: 'back', value: v }))} />
            <span>investovali</span>
            <Seg values={AMOUNTS} value={monthly} fmt={(v) => `${(v / 1000).toLocaleString('cs-CZ')} tis.`} onChange={(v) => (setMonthly(v), track('timemachine_change', { field: 'monthly', value: v }))} />
            <span>Kč měsíčně</span>
          </div>
          <GrowthChart lines={lines} loading={!data} />
          <p class="mt-3 text-[11.5px] leading-snug text-[var(--color-faint)]">
            Reálné měsíční ceny vč. reinvestovaných dividend (Alpha Vantage) přepočtené kurzy ČNB{data?.asOf ? `, k ${ymCz(data.asOf.slice(0, 7))}` : ''}. Bez poplatků brokera a daní. Minulé výnosy nezaručují budoucí.
          </p>
        </div>

        {/* Metriky */}
        <div class="card space-y-6 p-5 sm:p-7">
          <Metric title="Poplatek ročně" note="z 100 000 Kč" picked={picked} get={(e) => e.ter} fmt={(v) => `${ter(v)} · ${czk(v * 100000)}`} best="min" />
          <Metric title="Výnos za 10 let" note="ročně, v USD" picked={picked} get={(e) => e.returns.y10} fmt={(v) => pct(v, 1, true)} best="max" />
          <Metric title="Velikost fondu" note="USD" picked={picked} get={(e) => e.netAssets} fmt={(v) => usdShort(v)} />
          <div>
            <p class="text-[13.5px] font-medium">Koupíte u evropského brokera?</p>
            <div class="mt-2 flex flex-wrap gap-2">
              {picked.map((p) => (
                <span class="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-neg-soft)] px-2.5 py-1 text-[12.5px] font-medium text-[var(--color-neg)]">
                  <span class="mono">{p.etf.ticker}</span> ne
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dvojčata */}
      <div class="card-dark p-5 sm:p-7">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="flex items-center gap-2 text-[15px] font-medium text-white">
            <FlagEU size={14} /> Co si koupit místo nich
          </p>
          {!unlocked && <p class="text-[13px] text-zinc-400">1 zdarma · ostatní v balíčku</p>}
        </div>
        <div class="mt-4 grid gap-3 md:grid-cols-3">
          {picked.map((p) => {
            const open = unlocked || p.etf.twin.free;
            return (
              <div key={p.etf.ticker} class="animate-fade rounded-2xl bg-[var(--color-dark-2)] p-4 ring-1 ring-[var(--color-dark-line)] transition-transform duration-300 hover:-translate-y-0.5">
                <p class="flex items-center gap-2 text-[12.5px] text-zinc-400">
                  <span class="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  <span class="mono">{p.etf.ticker}</span> → {p.etf.twin.match === 'exact' ? 'stejný index' : 'nejbližší alternativa'}
                </p>
                {open ? (
                  <>
                    <p class="mt-2 text-[15px] leading-snug font-medium text-white">{p.etf.twin.name}</p>
                    <p class="mono mt-1 text-[12.5px] text-[var(--color-lime)]">{p.etf.twin.isin}</p>
                    <p class="mt-1 text-[12.5px] text-zinc-400">
                      TER {ter(p.etf.twin.ter)}
                      {p.etf.twin.ticker && <> · {p.etf.twin.ticker}</>} ·{' '}
                      <a href={p.etf.twin.sourceUrl} target="_blank" rel="noopener nofollow" class="underline decoration-zinc-600 underline-offset-2 hover:text-white">
                        zdroj
                      </a>
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    class="mt-2 block w-full text-left"
                    data-track="compare_lock"
                    onClick={() => {
                      track('lock_click', { where: 'compare', ticker: p.etf.ticker });
                      openLead({ source: 'compare_lock', tickers, headline: `Dvojče k ${p.etf.ticker} a dalších 11 ETF vám pošleme do e-mailu` });
                    }}
                  >
                    <span class="locked block text-[15px] font-medium text-white" aria-hidden="true">
                      Xxxxxxx Xxx XXX UCITS ETF
                    </span>
                    <span class="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-lime)]">
                      <IconLock size={14} /> Odemknout dvojče
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {!unlocked ? (
          <button
            type="button"
            class="btn btn-accent mt-5 w-full sm:w-auto"
            data-track="compare_unlock_all"
            onClick={() => {
              track('lock_click', { where: 'compare_all' });
              openLead({ source: 'compare_lock', tickers, headline: 'Všech 12 dvojčat s ISIN + checklist a šablonu pošleme do e-mailu' });
            }}
          >
            <IconLock size={16} /> Odemknout všech 12 dvojčat <span class="arr">→</span>
          </button>
        ) : (
          <p class="mt-5 inline-flex items-center gap-2 text-[13.5px] text-[var(--color-lime)]">
            <IconCheck size={16} /> Dvojčata odemčena. Kompletní překladač najdete v balíčku.
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Části

function Insight({ list }: { list: EtfLite[] }) {
  if (list.length < 2) return null;
  const withTer = list.filter((e) => e.ter != null).sort((a, b) => a.ter! - b.ter!);
  let text = '';
  if (new Set(list.map((e) => e.category)).size === 1 && withTer.length >= 2 && withTer.at(-1)!.ter! > withTer[0].ter!) {
    const ratio = withTer.at(-1)!.ter! / withTer[0].ter!;
    text = `Stejný trh (${list[0].categoryCz}), skoro stejný výsledek. ${withTer.at(-1)!.ticker} je ale ${(Math.round(ratio * 10) / 10).toLocaleString('cs-CZ')}× dražší než ${withTer[0].ticker}. A v Česku nekoupíte ani jedno.`;
  } else {
    const best = [...list].filter((e) => e.returns.y10 != null).sort((a, b) => b.returns.y10! - a.returns.y10!)[0];
    text = `Nejlevnější je ${withTer[0]?.ticker ?? '—'}${best ? `, nejvíc za 10 let vydělalo ${best.ticker}` : ''}. Ani jedno si u evropského brokera nekoupíte, dvojčata ano.`;
  }
  return (
    <p key={text} class="animate-fade max-w-3xl text-[clamp(1.05rem,1.6vw,1.3rem)] leading-snug font-medium tracking-[-0.015em] text-[var(--color-ink)]">
      {text}
    </p>
  );
}

function Seg({ values, value, fmt, onChange }: { values: number[]; value: number; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <span class="seg">
      {values.map((v) => (
        <button type="button" aria-pressed={v === value} onClick={() => onChange(v)} class="num">
          {fmt(v)}
        </button>
      ))}
    </span>
  );
}

function Metric({ title, note, picked, get, fmt, best }: { title: string; note: string; picked: { etf: EtfLite; color: string }[]; get: (e: EtfLite) => number | null; fmt: (v: number) => string; best?: 'min' | 'max' }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const vals = picked.map((p) => get(p.etf));
  const max = Math.max(...vals.map((v) => Math.abs(v ?? 0)), 1e-9);
  const valid = vals.filter((v) => v != null) as number[];
  const bestVal = best && valid.length > 1 ? (best === 'min' ? Math.min(...valid) : Math.max(...valid)) : null;
  const unique = bestVal != null && valid.filter((v) => v === bestVal).length === 1;
  return (
    <div ref={ref}>
      <p class="text-[13.5px] font-medium">
        {title} <span class="font-normal text-[var(--color-faint)]">· {note}</span>
      </p>
      <div class="mt-2.5 space-y-2">
        {picked.map((p, i) => {
          const v = vals[i];
          const w = v == null ? 0 : Math.max(4, (Math.abs(v) / max) * 100);
          const isBest = unique && v === bestVal;
          return (
            <div class="grid grid-cols-[3.2rem_1fr] items-center gap-3">
              <span class="mono text-[12.5px] text-[var(--color-ink-2)]">{p.etf.ticker}</span>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-soft)]">
                  <div class="h-full rounded-full transition-[width] duration-1000 ease-[var(--ease-out-expo)]" style={{ width: seen ? `${w}%` : '0%', background: p.color }} />
                </div>
                <span class={`num w-[9.5rem] shrink-0 text-right text-[12.5px] ${isBest ? 'font-semibold text-[var(--color-accent-strong)]' : 'text-[var(--color-ink-2)]'}`}>
                  {v == null ? '—' : fmt(v)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Line = { etf: EtfLite; color: string; points: TimeMachinePoint[] };

const axis = (v: number) => (v >= 1e6 ? `${(v / 1e6).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} mil.` : `${Math.round(v / 1e3)} tis.`);

function GrowthChart({ lines, loading }: { lines: Line[]; loading: boolean }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.25);
  const [boxRef, W] = useWidth<HTMLDivElement>(640);
  const [hover, setHover] = useState<number | null>(null);
  const base = lines.reduce<Line | null>((a, l) => (!a || l.points.length > a.points.length ? l : a), null);
  const pts = base?.points ?? [];
  const n = Math.max(pts.length - 1, 1);
  const H = W < 500 ? 240 : 280;
  const pad = { t: 18, r: W < 500 ? 58 : 76, b: 24, l: 4 };
  const max = Math.max(1, ...lines.flatMap((l) => l.points.map((p) => p.value))) * 1.05;
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const offset = (l: Line) => pts.length - l.points.length; // kratší historie začíná později
  const path = (l: Line, k: 'value' | 'invested') => l.points.map((p, i) => `${i ? 'L' : 'M'}${x(i + offset(l)).toFixed(1)},${y(p[k]).toFixed(1)}`).join('');
  const years = [...new Set(pts.map((p) => p.ym.slice(0, 4)))];
  const step = Math.ceil(years.length / 5);
  const key = lines.map((l) => l.etf.ticker + l.points.length).join() + max.toFixed(0);

  // Popisky na konci čar – rozestup, aby se nepřekrývaly
  const ends = lines
    .filter((l) => l.points.length)
    .map((l) => ({ l, v: l.points.at(-1)!.value, y: y(l.points.at(-1)!.value) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 30) ends[i].y = ends[i - 1].y + 30;

  function move(e: PointerEvent) {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * n))));
  }

  if (loading)
    return (
      <div ref={ref} class="mt-5">
        <div ref={boxRef} />
        <div class="h-[260px] animate-pulse rounded-2xl bg-[var(--color-soft)]" />
      </div>
    );

  const invested = base?.points.at(-1)?.invested ?? 0;
  return (
    <div ref={ref} class="relative mt-5">
      <div ref={boxRef} />
      <div class="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[var(--color-ink-2)]">
        {lines.map((l) => (
          <span class="inline-flex items-center gap-1.5">
            <span class="h-0 w-4 border-t-[2.5px]" style={{ borderColor: l.color }} />
            <span class="mono">{l.etf.ticker}</span>
          </span>
        ))}
        <span class="inline-flex items-center gap-1.5 text-[var(--color-faint)]">
          <span class="h-0 w-4 border-t-2 border-dashed border-[var(--color-faint)]" /> vloženo {czkShort(invested)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} class="w-full touch-pan-y" role="img" aria-label="Vývoj hodnoty pravidelné investice" onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="var(--color-line)" stroke-dasharray="2 4" />
            <text x={pad.l} y={y(max * f) - 5} font-size="10.5" fill="var(--color-faint)" font-family="var(--font-mono)">
              {axis(max * f)}
            </text>
          </g>
        ))}
        {years.map((yr, i) =>
          i % step === 0 ? (
            <text x={x(pts.findIndex((p) => p.ym.startsWith(yr)))} y={H - 6} font-size="10.5" fill="var(--color-faint)" font-family="var(--font-mono)">
              {yr}
            </text>
          ) : null,
        )}
        {seen && base && (
          <g key={key}>
            <path d={path(base, 'invested')} fill="none" stroke="var(--color-faint)" stroke-width="1.5" stroke-dasharray="4 4" />
            {lines.map((l, i) => (
              <path d={path(l, 'value')} fill="none" stroke={l.color} stroke-width="2.5" stroke-linejoin="round" pathLength={1} class="draw" style={{ '--d': i * 120 } as any} />
            ))}
          </g>
        )}
        {seen &&
          ends.map((e) => (
            <g class="animate-fade" style={{ animationDelay: '0.9s' }}>
              <circle cx={x(n)} cy={y(e.v)} r="4" fill={e.l.color} stroke="#fff" stroke-width="2" />
              <text x={x(n) + 10} y={e.y + 4} font-size="12" font-weight="600" fill="var(--color-ink)" font-family="var(--font-sans)">
                {axis(e.v)}
              </text>
            </g>
          ))}
        {hover != null && pts[hover] && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--color-ink)" opacity="0.2" />
        )}
        {hover != null &&
          lines.map((l) => {
            const p = l.points[hover - offset(l)];
            return p ? <circle cx={x(hover)} cy={y(p.value)} r="4.5" fill={l.color} stroke="#fff" stroke-width="2" /> : null;
          })}
      </svg>
      {hover != null && pts[hover] && (
        <div class="pointer-events-none absolute top-10 rounded-xl bg-[var(--color-ink)] px-3 py-2 text-[12px] leading-snug text-white shadow-xl" style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? '-108%' : '8%'})` }}>
          <div class="font-semibold">{ymCz(pts[hover].ym)}</div>
          {lines.map((l) => {
            const p = l.points[hover - offset(l)];
            return (
              <div class="num flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
                {l.etf.ticker} {p ? czkShort(p.value) : '—'}
              </div>
            );
          })}
          <div class="num text-zinc-400">vloženo {czkShort(pts[hover].invested)}</div>
        </div>
      )}
      <Totals lines={lines} />
    </div>
  );
}

function Totals({ lines }: { lines: Line[] }) {
  return (
    <div class="mt-4 grid grid-cols-3 gap-3">
      {lines.map((l) => (
        <Total key={l.etf.ticker} l={l} />
      ))}
    </div>
  );
}

function Total({ l }: { l: Line }) {
  const last = l.points.at(-1);
  const v = useCountUp(last?.value ?? 0);
  const gain = last ? last.value / last.invested - 1 : null;
  return (
    <div class="rounded-2xl bg-[var(--color-soft)] p-3">
      <p class="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
        <span class="h-2 w-2 rounded-full" style={{ background: l.color }} />
        <span class="mono">{l.etf.ticker}</span>
      </p>
      <p class="num mt-1 text-[clamp(0.95rem,2.4vw,1.25rem)] leading-tight font-semibold tracking-[-0.03em]">{last ? czk(v) : '—'}</p>
      {gain != null && <p class={`num text-[12px] ${gain >= 0 ? 'text-[var(--color-accent-strong)]' : 'text-[var(--color-neg)]'}`}>{pct(gain, 0, true)}</p>}
    </div>
  );
}
