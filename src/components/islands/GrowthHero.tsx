// Hero varianta „růst“: kolik může být z měsíční částky za N let. Vklady vs. výnos jako graf,
// předpoklad a riziko jsou vidět hned pod číslem (ne v patičce).
import { useMemo, useState } from 'preact/hooks';
import { futureValue } from '../../lib/finance';
import { czk, czkShort, pct } from '../../lib/format';
import { $context, openLead } from '../../lib/store';
import { track } from '../../lib/track';
import { useCountUp, useWidth } from '../../lib/useCountUp';

interface Props {
  gross: number;
  fee: number;
  defaultMonthly: number;
  defaultYears: number;
  spyY20: number | null;
}

const AMOUNTS = [1000, 3000, 5000, 10000];
const YEARS = [10, 20, 30];

export default function GrowthHero({ gross, fee, defaultMonthly, defaultYears, spyY20 }: Props) {
  const [monthly, setMonthly] = useState(defaultMonthly);
  const [years, setYears] = useState(defaultYears);
  const series = useMemo(() => Array.from({ length: years + 1 }, (_, y) => ({ y, value: futureValue(monthly, y, gross, fee), invested: monthly * 12 * y })), [monthly, years]);
  const last = series[series.length - 1];
  const value = useCountUp(last.value);
  const gain = useCountUp(last.value - last.invested);

  function pick(field: 'monthly' | 'years', v: number) {
    field === 'monthly' ? setMonthly(v) : setYears(v);
    track('hero_chip_click', { [field]: v });
    const m = field === 'monthly' ? v : monthly;
    const y = field === 'years' ? v : years;
    $context.set({ ...$context.get(), result: { kalkulacka: 'rust', mesicne: m, let: y, hodnota: Math.round(futureValue(m, y, gross, fee)) } });
  }

  return (
    <div class="relative">
      <div class="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(201,242,75,0.4),transparent)] blur-2xl" />
      <div class="card p-5 sm:p-7">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-2.5 text-[15px] text-[var(--color-ink-2)]">
          <span>Když dáte</span>
          <span class="seg">
            {AMOUNTS.map((a) => (
              <button type="button" class="num" aria-pressed={a === monthly} onClick={() => pick('monthly', a)} data-track="hero_amount">
                {a.toLocaleString('cs-CZ')}
              </button>
            ))}
          </span>
          <span>Kč měsíčně, za</span>
          <span class="seg">
            {YEARS.map((y) => (
              <button type="button" class="num" aria-pressed={y === years} onClick={() => pick('years', y)} data-track="hero_years">
                {y}
              </button>
            ))}
          </span>
          <span>let z toho může být</span>
        </div>

        <p class="num mt-4 text-[clamp(2.6rem,6vw,3.6rem)] leading-none font-semibold tracking-[-0.045em]">{czk(value)}</p>
        <p class="mt-2 text-[14.5px] text-[var(--color-muted)]">
          Vložíte <span class="font-medium text-[var(--color-ink)]">{czkShort(last.invested)}</span>, zbytek{' '}
          <span class="font-medium text-[var(--color-accent-strong)]">+{czkShort(gain)}</span> vydělá trh.
        </p>

        <MiniChart series={series} />

        <p class="mt-3 text-[12.5px] leading-snug text-[var(--color-muted)]">
          Při výnosu {pct(gross, 0)} ročně a poplatku levného ETF.
          {spyY20 != null && <> Akcie USA (S&P 500) za posledních 20 let vynesly {pct(spyY20, 1)} ročně.</>} Výnos není zaručený a hodnota může i klesat.
        </p>
        <button
          type="button"
          class="btn btn-primary mt-5 w-full"
          data-track="hero_growth_cta"
          onClick={() => {
            track('lock_click', { where: 'hero_growth', monthly, years });
            openLead({ source: 'hero_growth', result: { kalkulacka: 'rust', mesicne: monthly, let: years, hodnota: Math.round(last.value) }, headline: 'Jak začít: návod krok za krokem a plán v Excelu pošleme do e-mailu' });
          }}
        >
          Chci začít, pošlete mi návod <span class="arr">→</span>
        </button>
      </div>
    </div>
  );
}

function MiniChart({ series }: { series: { y: number; value: number; invested: number }[] }) {
  const [ref, W] = useWidth<HTMLDivElement>(460);
  const H = W < 420 ? 90 : 120;
  const n = series.length - 1;
  const max = series[n].value * 1.04;
  const x = (i: number) => (i / n) * W;
  const y = (v: number) => H - (v / max) * (H - 6);
  const line = (k: 'value' | 'invested') => series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join('');
  const area = (k: 'value' | 'invested') => `${line(k)}L${W},${H}L0,${H}Z`;
  const key = `${n}-${Math.round(max)}`;
  return (
    <div ref={ref} class="mt-5">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Vklady a výnos v čase" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gh-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#1baf7a" stop-opacity="0.35" />
            <stop offset="1" stop-color="#1baf7a" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <g key={key} class="animate-fade">
          <path d={area('value')} fill="url(#gh-fill)" />
          <path d={area('invested')} fill="var(--color-soft-2)" />
          <path d={line('value')} fill="none" stroke="#1baf7a" stroke-width="2.5" pathLength={1} class="draw" />
        </g>
      </svg>
      <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-[var(--color-ink-2)]">
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm bg-[var(--color-soft-2)] ring-1 ring-[var(--color-line)]" /> Vaše vklady
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm bg-[#1baf7a]" /> Co vydělá trh
        </span>
        <span class="ml-auto text-[var(--color-faint)]">dnes → za {n} let</span>
      </div>
    </div>
  );
}
