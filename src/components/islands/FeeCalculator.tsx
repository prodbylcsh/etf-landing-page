// Kalkulačka poplatků: všechny vstupy nastavitelné (vklad, doba, poplatek vašeho fondu, výnos).
// Vizualizace: sušenka (podíl, který ukousnou poplatky) + vývoj v čase s vyznačenou „mezerou“.
import { useEffect, useMemo, useState } from 'preact/hooks';
import { futureValue } from '../../lib/finance';
import { czk, czkShort, dec, pct, plural, ter } from '../../lib/format';
import { $context, openLead } from '../../lib/store';
import { track } from '../../lib/track';
import { useCountUp, useInView, useWidth } from '../../lib/useCountUp';
import CookieChart from './CookieChart';

interface Props {
  cheapFee: number;
  defaultFundFee: number;
  fundSource: string;
  fundSourceUrl: string;
  spyY20: number | null;
}

export default function FeeCalculator({ cheapFee, defaultFundFee, fundSource, fundSourceUrl, spyY20 }: Props) {
  const [monthly, setMonthly] = useState(3000);
  const [years, setYears] = useState(25);
  const [fundFee, setFundFee] = useState(Math.round(defaultFundFee * 10000) / 10000);
  const [gross, setGross] = useState(0.07);
  const [touched, setTouched] = useState(false);

  const series = useMemo(
    () =>
      Array.from({ length: years + 1 }, (_, y) => ({
        y,
        cheap: futureValue(monthly, y, gross, cheapFee),
        fund: futureValue(monthly, y, gross, fundFee),
        invested: monthly * 12 * y,
      })),
    [monthly, years, gross, fundFee, cheapFee],
  );
  const last = series[series.length - 1];
  const lost = last.cheap - last.fund;
  const lostAnim = useCountUp(lost);

  useEffect(() => {
    const id = setTimeout(() => {
      $context.set({ ...$context.get(), result: { kalkulacka: 'poplatky', mesicne: monthly, let: years, poplatek_fondu: fundFee, ukousnuto: Math.round(lost) } });
      if (touched) track('calc_result_view', { calc: 'fees', monthly, years, fundFee, gross, lost: Math.round(lost) });
    }, 800);
    return () => clearTimeout(id);
  }, [monthly, years, fundFee, gross]);

  const change = (field: string, fn: (v: number) => void) => (e: Event) => {
    fn(Number((e.target as HTMLInputElement).value));
    if (!touched) {
      setTouched(true);
      track('calc_change', { calc: 'fees', field });
    }
  };

  return (
    <div class="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
      {/* Ovládání */}
      <div class="card space-y-7 p-6 sm:p-8">
        <Slider label="Měsíčně investuji" min={500} max={30000} step={500} value={monthly} onInput={change('monthly', setMonthly)}>
          <span class="inline-flex items-baseline gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={100}
              max={500000}
              step={100}
              value={monthly}
              onChange={(e) => {
                const v = Math.max(100, Math.min(500000, Number((e.target as HTMLInputElement).value) || 0));
                setMonthly(v);
                track('calc_change', { calc: 'fees', field: 'monthly_input' });
              }}
              class="num w-[5.5ch] border-b border-dashed border-[var(--color-faint)] bg-transparent text-right text-[1.35rem] font-semibold outline-none focus:border-[var(--color-ink)]"
              aria-label="Měsíční vklad v Kč"
            />
            <span class="text-[1.1rem] font-semibold">Kč</span>
          </span>
        </Slider>
        <Slider label="Po dobu" min={5} max={40} step={1} value={years} onInput={change('years', setYears)}>
          <span class="num text-[1.35rem] font-semibold">
            {years} {plural(years, ['rok', 'roky', 'let'])}
          </span>
        </Slider>
        <Slider label="Poplatek vašeho fondu" hint="Najdete ho v KID fondu jako „průběžné náklady“." min={0.003} max={0.03} step={0.0005} value={fundFee} onInput={change('fundFee', setFundFee)}>
          <span class="num text-[1.35rem] font-semibold">{dec(fundFee * 100, 2)} %</span>
        </Slider>
        <details class="faq group text-[14px]">
          <summary class="flex cursor-pointer list-none items-center justify-between text-[var(--color-muted)] [&::-webkit-details-marker]:hidden">
            Předpoklad výnosu: {pct(gross, 0)} ročně <span class="transition-transform group-open:rotate-45">+</span>
          </summary>
          <div class="pt-4">
            <Slider label="Hrubý výnos ročně" min={0.02} max={0.11} step={0.005} value={gross} onInput={change('gross', setGross)}>
              <span class="num text-[1.1rem] font-semibold">{dec(gross * 100, 1)} %</span>
            </Slider>
            {spyY20 != null && <p class="mt-2 text-[12.5px] text-[var(--color-muted)]">Pro představu: S&P 500 (SPY) vydělal za 20 let {pct(spyY20, 1)} ročně v USD. Budoucnost může být horší.</p>}
          </div>
        </details>
      </div>

      {/* Výsledek */}
      <div class="card overflow-hidden p-6 sm:p-8">
        <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <CookieChart share={lost / last.cheap} size={150} />
          <div class="text-center sm:text-left">
            <p class="text-[14px] text-[var(--color-muted)]">
              Poplatky vám za {years} {plural(years, ['rok', 'roky', 'let'])} ukousnou
            </p>
            <p class="num text-[clamp(2.2rem,5vw,3.2rem)] leading-none font-semibold tracking-[-0.045em] text-[var(--color-neg)]">{czk(lostAnim)}</p>
            <p class="mt-2 text-[13.5px] text-[var(--color-muted)]">
              Vložíte {czk(last.invested)}. S ETF ({ter(cheapFee)}) budete mít {czkShort(last.cheap)}, s fondem ({dec(fundFee * 100, 2)} %) {czkShort(last.fund)}.
            </p>
          </div>
        </div>
        <GapChart series={series} />
        <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[12px] text-[var(--color-faint)]">
            Typický fond: {fundSource} (
            <a href={fundSourceUrl} target="_blank" rel="noopener" class="underline">
              zdroj
            </a>
            ). Bez vstupních poplatků a daní. Ilustrace, ne doporučení.
          </p>
          <button
            type="button"
            class="btn btn-primary shrink-0"
            data-track="calc_fees_cta"
            onClick={() => {
              track('lock_click', { where: 'calc_fees', lost: Math.round(lost) });
              openLead({ source: 'calc_fees', result: { kalkulacka: 'poplatky', mesicne: monthly, let: years, poplatek_fondu: fundFee, ukousnuto: Math.round(lost) }, headline: `Ušetřete ${czkShort(lost)}: levná dvojčata + šablona plánu v e-mailu` });
            }}
          >
            Poslat výpočet + šablonu <span class="arr">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Graf: ETF vs. fond, mezera = poplatky

function GapChart({ series }: { series: { y: number; cheap: number; fund: number; invested: number }[] }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const [boxRef, W] = useWidth<HTMLDivElement>(600);
  const [hover, setHover] = useState<number | null>(null);
  const H = W < 500 ? 200 : 230;
  const pad = { t: 16, r: 12, b: 26, l: 12 };
  const max = series[series.length - 1].cheap * 1.06;
  const n = series.length - 1;
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = (k: 'cheap' | 'fund' | 'invested') => series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join('');
  const gap = `${line('cheap')}${series
    .map((p, i) => [x(i), y(p.fund)] as const)
    .reverse()
    .map(([a, b]) => `L${a.toFixed(1)},${b.toFixed(1)}`)
    .join('')}Z`;
  const ticks = series.filter((p) => p.y % (n > 20 ? 10 : 5) === 0 && (W >= 500 || p.y !== n || n % 10 === 0));
  const hp = hover != null ? series[hover] : null;

  function move(e: PointerEvent) {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * n))));
  }

  return (
    <div ref={ref} class="relative mt-6">
      <div ref={boxRef} />
      <div class="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-[var(--color-ink-2)]">
        <Legend color="var(--color-s3)">ETF dvojče</Legend>
        <Legend color="var(--color-faint)">Váš fond</Legend>
        <Legend color="var(--color-neg)" dashed>
          Ukousnuto poplatky
        </Legend>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} class="w-full touch-pan-y" role="img" aria-label="Vývoj hodnoty investice s ETF a s fondem" onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}>
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="rgba(227,73,72,0.08)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(227,73,72,0.35)" stroke-width="1.5" />
          </pattern>
        </defs>
        {[0.33, 0.66, 1].map((f) => (
          <line x1={pad.l} x2={W - pad.r} y1={y(max * f * 0.94)} y2={y(max * f * 0.94)} stroke="var(--color-line)" stroke-dasharray="2 4" />
        ))}
        {seen && (
          <>
            <path d={gap} fill="url(#hatch)" class="animate-fade" style={{ animationDelay: '0.6s' }} />
            <path d={line('invested')} fill="none" stroke="var(--color-line)" stroke-width="1.5" />
            <path d={line('fund')} fill="none" stroke="var(--color-faint)" stroke-width="2" pathLength={1} class="draw" />
            <path d={line('cheap')} fill="none" stroke="var(--color-s3)" stroke-width="2.5" stroke-linejoin="round" pathLength={1} class="draw" />
          </>
        )}
        {ticks.map((p) => (
          <text x={x(p.y)} y={H - 6} text-anchor="middle" font-size="11" fill="var(--color-faint)" font-family="var(--font-mono)">
            {p.y === 0 ? 'dnes' : `${p.y}. rok`}
          </text>
        ))}
        {hp && (
          <g>
            <line x1={x(hover!)} x2={x(hover!)} y1={pad.t} y2={H - pad.b} stroke="var(--color-ink)" stroke-width="1" opacity="0.25" />
            <circle cx={x(hover!)} cy={y(hp.cheap)} r="5" fill="var(--color-s3)" stroke="#fff" stroke-width="2" />
            <circle cx={x(hover!)} cy={y(hp.fund)} r="4.5" fill="var(--color-faint)" stroke="#fff" stroke-width="2" />
          </g>
        )}
      </svg>
      {hp && (
        <div class="pointer-events-none absolute top-8 rounded-xl bg-[var(--color-ink)] px-3 py-2 text-[12px] leading-snug text-white shadow-xl" style={{ left: `${(x(hover!) / W) * 100}%`, transform: `translateX(${hover! > n / 2 ? '-108%' : '8%'})` }}>
          <div class="font-semibold">{hp.y}. rok</div>
          <div class="num">ETF {czkShort(hp.cheap)}</div>
          <div class="num text-zinc-400">Fond {czkShort(hp.fund)}</div>
          <div class="num text-[#ff8a8a]">−{czkShort(hp.cheap - hp.fund)}</div>
        </div>
      )}
    </div>
  );
}

function Legend({ color, dashed, children }: { color: string; dashed?: boolean; children: any }) {
  return (
    <span class="inline-flex items-center gap-1.5">
      <span class="inline-block h-0 w-4" style={{ borderTop: `${dashed ? 2 : 2.5}px ${dashed ? 'dashed' : 'solid'} ${color}` }} />
      {children}
    </span>
  );
}

function Slider({ label, hint, min, max, step, value, onInput, children }: { label: string; hint?: string; min: number; max: number; step: number; value: number; onInput: (e: Event) => void; children: any }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <label class="block">
      <span class="flex items-baseline justify-between gap-3">
        <span class="text-[14.5px] text-[var(--color-ink-2)]">{label}</span>
        {children}
      </span>
      <input type="range" class="range mt-2" min={min} max={max} step={step} value={value} onInput={onInput} style={{ '--p': `${Math.min(100, Math.max(0, p))}%` } as any} />
      {hint && <span class="mt-1 block text-[12px] text-[var(--color-faint)]">{hint}</span>}
    </label>
  );
}
