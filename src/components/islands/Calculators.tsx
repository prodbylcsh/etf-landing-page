// Dvě kalkulačky v záložkách: „Kolik ukousnou poplatky“ a „Stroj času“ (reálná historická data).
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { feeComparison, timeMachine, type Series, type TimeMachinePoint } from '../../lib/finance';
import { czk, czkShort, pct, plural, ter, ymCz } from '../../lib/format';
import { $context, openLead } from '../../lib/store';
import { track } from '../../lib/track';

interface Props {
  cheapFee: number;
  fundFee: number;
  fundSource: string;
  fundSourceUrl: string;
  usdczk: number;
  machineTickers: { ticker: string; label: string }[];
  /** Skutečný roční výnos SPY za 20 let (z dat) */
  spyY20: number | null;
}

type Tab = 'fees' | 'machine';

export default function Calculators(props: Props) {
  const [tab, setTab] = useState<Tab>('fees');
  return (
    <div>
      <div class="grid grid-cols-2 rounded-xl bg-[var(--color-paper-2)] p-1" role="tablist" aria-label="Kalkulačky">
        {(
          [
            ['fees', 'Kolik ukousnou poplatky'],
            ['machine', 'Stroj času'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            role="tab"
            aria-selected={tab === id}
            class={`min-h-11 rounded-lg px-2 text-[14.5px] font-semibold transition-colors ${tab === id ? 'bg-[var(--color-ink)] text-[var(--color-paper)]' : 'text-[var(--color-ink-2)]'}`}
            onClick={() => {
              setTab(id);
              track('calc_tab', { tab: id });
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div class="mt-4">{tab === 'fees' ? <FeeCalc {...props} /> : <TimeMachine {...props} />}</div>
    </div>
  );
}

// ------------------------------------------------------------------ Poplatky

function FeeCalc({ cheapFee, fundFee, fundSource, fundSourceUrl, spyY20 }: Props) {
  const [monthly, setMonthly] = useState(3000);
  const [years, setYears] = useState(25);
  const [gross, setGross] = useState(0.07);
  const r = feeComparison(monthly, years, gross, cheapFee, fundFee);
  const changed = useRef(false);

  const onChange = (name: string, fn: (v: number) => void) => (e: Event) => {
    const v = Number((e.target as HTMLInputElement).value);
    fn(v);
    if (!changed.current) track('calc_change', { calc: 'fees', field: name }, { once: true });
    changed.current = true;
  };

  useEffect(() => {
    const id = setTimeout(() => {
      track('calc_result_view', { calc: 'fees', monthly, years, gross, lost: Math.round(r.lost) });
      $context.set({ ...$context.get(), result: { kalkulacka: 'poplatky', mesicne: monthly, let: years, ukousnuto: Math.round(r.lost) } });
    }, 900);
    return () => clearTimeout(id);
  }, [monthly, years, gross]);

  return (
    <div class="grid gap-5 md:grid-cols-[1fr_1.15fr] md:items-start">
      <div class="space-y-4">
        <Slider label="Měsíčně investuji" value={czk(monthly)} min={500} max={20000} step={500} current={monthly} onInput={onChange('monthly', setMonthly)} />
        <Slider label="Po dobu" value={`${years} ${plural(years, ['rok', 'roky', 'let'])}`} min={5} max={40} step={1} current={years} onInput={onChange('years', setYears)} />
        <details class="group text-[14px]">
          <summary class="cursor-pointer list-none text-[var(--color-muted)] underline decoration-dotted underline-offset-2">Předpoklad výnosu: {pct(gross, 0)} ročně před poplatky</summary>
          <div class="mt-3">
            <Slider label="Hrubý výnos ročně" value={pct(gross, 0)} min={0.03} max={0.1} step={0.01} current={gross} onInput={onChange('gross', setGross)} />
            <p class="mt-1 text-[12.5px] text-[var(--color-muted)]">
              {spyY20 != null ? <>Pro srovnání: SPY (S&P 500) vydělal za posledních 20 let {pct(spyY20, 1)} ročně (v USD, s dividendami). </> : null}Budoucnost může být horší.
            </p>
          </div>
        </details>
      </div>

      <div class="terminal p-4" aria-live="polite">
        <p class="text-[14px] text-[#b9c7c0]">
          Fond s poplatkem {pct(fundFee, 2)} vám za {years} {plural(years, ['rok', 'roky', 'let'])} ukousne
        </p>
        <p class="num mt-1 text-[2.4rem] leading-none font-bold text-[var(--color-amber)]">{czk(r.lost)}</p>
        <p class="mt-1 text-[13px] text-[#9db0a7]">oproti ETF s poplatkem {ter(cheapFee)}. Vložíte celkem {czk(r.invested)}.</p>
        <div class="mt-4 space-y-3 text-[13px]">
          <Bar label={`ETF dvojče (${ter(cheapFee)})`} value={r.cheap} max={r.cheap} color="var(--color-phosphor)" />
          <Bar label={`Typický český fond (${pct(fundFee, 2)})`} value={r.expensive} max={r.cheap} color="#c68a00" />
          <Bar label="Vloženo" value={r.invested} max={r.cheap} color="#5d6d66" />
        </div>
        <button
          type="button"
          class="btn mt-4 w-full bg-[var(--color-amber)] text-[var(--color-term)]"
          data-track="calc_fees_cta"
          onClick={() => {
            track('lock_click', { where: 'calc_fees', lost: Math.round(r.lost) });
            openLead({
              source: 'calc_fees',
              result: { kalkulacka: 'poplatky', mesicne: monthly, let: years, ukousnuto: Math.round(r.lost) },
              headline: `Pošleme vám výpočet a levná dvojčata, která vám ušetří ${czkShort(r.lost)}`,
            });
          }}
        >
          Poslat výpočet + levná dvojčata e-mailem
        </button>
        <p class="mt-3 text-[11.5px] leading-snug text-[#7f948a]">
          Poplatek fondu = {fundSource.toLowerCase()} (
          <a href={fundSourceUrl} target="_blank" rel="noopener" class="underline">
            zdroj
          </a>
          ). Nezahrnuje vstupní poplatky, poplatky brokera ani daně. Ilustrativní výpočet, ne investiční doporučení.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Stroj času

interface SeriesPayload {
  fx: Record<string, number>;
  series: Record<string, Series>;
  asOf: string;
}

let cache: Promise<SeriesPayload> | null = null;
const loadSeries = () => (cache ||= fetch('/data/series.json').then((r) => r.json()));

const BACK = [5, 10, 15, 20];
const AMOUNTS = [1000, 2000, 5000];

function TimeMachine({ usdczk, machineTickers }: Props) {
  const [data, setData] = useState<SeriesPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [ticker, setTicker] = useState(machineTickers[0]?.ticker ?? 'SPY');
  const [back, setBack] = useState(10);
  const [monthly, setMonthly] = useState(2000);

  useEffect(() => {
    loadSeries().then(setData, () => setFailed(true));
  }, []);

  const points = useMemo<TimeMachinePoint[]>(() => {
    const s = data?.series[ticker];
    if (!s?.length) return [];
    const last = s[s.length - 1][0];
    const [y, m] = last.split('-').map(Number);
    const start = `${y - back}-${String(m).padStart(2, '0')}`;
    return timeMachine(s, data!.fx, monthly, start, usdczk);
  }, [data, ticker, back, monthly]);

  const res = points.at(-1);
  const startYm = points[0]?.ym;
  const available = data?.series[ticker]?.[0]?.[0];

  useEffect(() => {
    if (!res) return;
    const id = setTimeout(() => {
      track('calc_result_view', { calc: 'machine', ticker, back, monthly, value: Math.round(res.value) });
      $context.set({ ...$context.get(), result: { kalkulacka: 'stroj_casu', etf: ticker, mesicne: monthly, let: back, vlozeno: Math.round(res.invested), hodnota: Math.round(res.value) } });
    }, 900);
    return () => clearTimeout(id);
  }, [res?.value]);

  if (failed) return <p class="text-[var(--color-muted)]">Historická data se nepodařilo načíst. Zkuste obnovit stránku.</p>;

  return (
    <div class="grid gap-5 md:grid-cols-[1fr_1.15fr] md:items-start">
      <div class="space-y-4">
        <Group label="Kdybyste investovali do">
          {machineTickers.map((t) => (
            <button
              type="button"
              class="chip"
              aria-pressed={t.ticker === ticker}
              onClick={() => {
                setTicker(t.ticker);
                track('timemachine_change', { field: 'ticker', value: t.ticker });
              }}
            >
              {t.ticker} <span class="font-sans text-[12px] font-normal opacity-70">{t.label}</span>
            </button>
          ))}
        </Group>
        <Group label="Každý měsíc">
          {AMOUNTS.map((a) => (
            <button
              type="button"
              class="chip"
              aria-pressed={a === monthly}
              onClick={() => {
                setMonthly(a);
                track('timemachine_change', { field: 'monthly', value: a });
              }}
            >
              {czk(a)}
            </button>
          ))}
        </Group>
        <Group label="Začít před">
          {BACK.map((b) => (
            <button
              type="button"
              class="chip"
              aria-pressed={b === back}
              disabled={!!available && Number(available.slice(0, 4)) > new Date().getFullYear() - b}
              onClick={() => {
                setBack(b);
                track('timemachine_change', { field: 'back', value: b });
              }}
            >
              {b} lety
            </button>
          ))}
        </Group>
      </div>

      <div class="terminal p-4" aria-live="polite">
        {!data ? (
          <div class="h-64 animate-pulse rounded-lg bg-[var(--color-term-2)]" />
        ) : res ? (
          <>
            <p class="text-[14px] text-[#b9c7c0]">
              Od {ymCz(startYm!)} jste vložili <span class="num text-white">{czk(res.invested)}</span>. Dnes byste měli
            </p>
            <p class="num mt-1 text-[2.4rem] leading-none font-bold text-[var(--color-phosphor)]">{czk(res.value)}</p>
            <p class="mt-1 text-[13px] text-[#9db0a7]">
              {res.value >= res.invested ? 'zisk' : 'ztráta'} <span class="num text-white">{czk(res.value - res.invested)}</span> ({pct(res.value / res.invested - 1, 0, true)})
            </p>
            <Chart points={points} />
            <button
              type="button"
              class="btn mt-3 w-full bg-[var(--color-phosphor)] text-[var(--color-term)]"
              data-track="calc_machine_cta"
              onClick={() => {
                track('lock_click', { where: 'calc_machine', ticker });
                openLead({
                  source: 'calc_machine',
                  tickers: [ticker],
                  headline: `Kde koupit ${ticker} v Česku? Dvojče a dalších 11 pošleme do e-mailu`,
                });
              }}
            >
              Jak to koupit v Česku? Poslat dvojče →
            </button>
            <p class="mt-3 text-[11.5px] leading-snug text-[#7f948a]">
              Reálná data: měsíční ceny {ticker} vč. reinvestovaných dividend (Alpha Vantage) a měsíční kurzy USD/CZK (ČNB), k {data.asOf ? ymCz(data.asOf.slice(0, 7)) : '—'}. Bez poplatků brokera a daní. Minulá výkonnost nezaručuje budoucí výnosy.
            </p>
          </>
        ) : (
          <p class="text-[#b9c7c0]">Pro toto ETF zatím nemáme historická data.</p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Graf (SVG, crosshair + tooltip)

function Chart({ points }: { points: TimeMachinePoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 320;
  const H = 150;
  const pad = { t: 10, r: 8, b: 18, l: 8 };
  const max = Math.max(...points.map((p) => Math.max(p.value, p.invested))) * 1.05;
  const x = (i: number) => pad.l + (i / Math.max(points.length - 1, 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = (key: 'value' | 'invested') => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join('');
  const area = `${line('value')}L${x(points.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const years = [...new Set(points.map((p) => p.ym.slice(0, 4)))];
  const tickYears = years.filter((_, i) => i % Math.ceil(years.length / 5) === 0);
  const hp = hover != null ? points[hover] : null;

  function move(e: PointerEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (points.length - 1));
    setHover(Math.min(points.length - 1, Math.max(0, i)));
  }

  return (
    <figure class="relative mt-4">
      <figcaption class="mb-1.5 flex gap-4 text-[12px] text-[#b9c7c0]">
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-0.5 w-4 bg-[var(--color-phosphor)]" /> Hodnota investice
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-0 w-4 border-t-2 border-dashed border-[#8a9a93]" /> Vloženo
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} class="w-full touch-pan-y" role="img" aria-label="Vývoj hodnoty pravidelné investice v čase" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="tm-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#3ddc84" stop-opacity="0.28" />
            <stop offset="1" stop-color="#3ddc84" stop-opacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="#2a3236" stroke-width="1" />
        ))}
        <path d={area} fill="url(#tm-fill)" />
        <path d={line('invested')} fill="none" stroke="#8a9a93" stroke-width="1.5" stroke-dasharray="4 3" />
        <path d={line('value')} fill="none" stroke="#3ddc84" stroke-width="2" stroke-linejoin="round" />
        {tickYears.map((yr) => {
          const i = points.findIndex((p) => p.ym.startsWith(yr));
          return (
            <text x={x(i)} y={H - 4} font-size="9" fill="#7f948a" font-family="var(--font-mono)">
              {yr}
            </text>
          );
        })}
        {hp && (
          <g>
            <line x1={x(hover!)} x2={x(hover!)} y1={pad.t} y2={y(0)} stroke="#c9d4ce" stroke-width="1" />
            <circle cx={x(hover!)} cy={y(hp.value)} r="4" fill="#3ddc84" stroke="#0f1214" stroke-width="2" />
            <circle cx={x(hover!)} cy={y(hp.invested)} r="3.5" fill="#8a9a93" stroke="#0f1214" stroke-width="2" />
          </g>
        )}
      </svg>
      {hp && (
        <div
          class="pointer-events-none absolute top-6 rounded-md bg-[var(--color-paper)] px-2.5 py-1.5 text-[11.5px] leading-tight text-[var(--color-ink)] shadow-lg"
          style={{ left: `${(x(hover!) / W) * 100}%`, transform: `translateX(${hover! > points.length / 2 ? '-105%' : '5%'})` }}
        >
          <div class="font-semibold">{ymCz(hp.ym)}</div>
          <div class="num">Hodnota {czkShort(hp.value)}</div>
          <div class="num text-[var(--color-muted)]">Vloženo {czkShort(hp.invested)}</div>
        </div>
      )}
    </figure>
  );
}

// ------------------------------------------------------------------ UI pomocníci

function Slider({ label, value, min, max, step, current, onInput }: { label: string; value: string; min: number; max: number; step: number; current: number; onInput: (e: Event) => void }) {
  return (
    <label class="block">
      <span class="flex items-baseline justify-between">
        <span class="text-[14.5px] font-medium text-[var(--color-ink-2)]">{label}</span>
        <span class="num text-[1.25rem] font-bold">{value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={current} onInput={onInput} class="mt-1" />
    </label>
  );
}

function Group({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <p class="mb-2 text-[14.5px] font-medium text-[var(--color-ink-2)]">{label}</p>
      <div class="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div class="flex justify-between gap-2 text-[#c9d4ce]">
        <span>{label}</span>
        <span class="num text-white">{czkShort(value)}</span>
      </div>
      <div class="mt-1 h-2.5 rounded-full bg-[var(--color-term-line)]">
        <div class="h-2.5 rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}
