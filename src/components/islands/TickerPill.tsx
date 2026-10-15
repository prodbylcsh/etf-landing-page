// Živý čítač v hero: kolik se ve 12 sledovaných ETF z NYSE zobchodovalo za dobu, co je návštěvník na stránce.
// Tempo = reálný průměrný denní objem v USD / délka seance × kurz ČNB.
import { useEffect, useRef, useState } from 'preact/hooks';
import { czkShort, dec } from '../../lib/format';
import { clock, marketState } from '../../lib/nyse';
import { track } from '../../lib/track';

interface Props {
  avgDailyUsd: number;
  etfCount: number;
  usdczk: number;
  method: string;
}

/** 1,95 mld. Kč s pevným počtem desetinných míst, aby číslo „necukalo“. */
function live(n: number) {
  if (n >= 1e9) return `${dec(n / 1e9, 2)} mld. Kč`;
  if (n >= 1e6) return `${dec(n / 1e6, 1)} mil. Kč`;
  return `${dec(n / 1e3, 0)} tis. Kč`;
}

export default function TickerPill({ avgDailyUsd, etfCount, usdczk }: Props) {
  const perSec = (avgDailyUsd / 23400) * usdczk;
  const start = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [state, setState] = useState<{ open: boolean; opensIn: number } | null>(null);
  const [info, setInfo] = useState(false);

  useEffect(() => {
    start.current = performance.now();
    setState(marketState());
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 80) {
        last = t;
        setElapsed((t - start.current) / 1000);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const id = setInterval(() => setState(marketState()), 1000);
    track('ticker_seen', { market_open: marketState().open }, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  if (!avgDailyUsd || !state) return <div class="h-9" />;

  return (
    <div class="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setInfo(!info);
          track('ticker_info', { open: !info });
        }}
        class="group inline-flex h-9 max-w-full items-center gap-2.5 rounded-full bg-[var(--color-soft)] pr-3.5 pl-1.5 text-[13.5px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-soft-2)]"
        aria-expanded={info}
        data-track="ticker"
      >
        <span class={`inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11.5px] font-semibold ${state.open ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]' : 'bg-white text-[var(--color-muted)]'}`}>
          <span class={`pulse-dot h-1.5 w-1.5 rounded-full ${state.open ? 'bg-[var(--color-accent)] text-[var(--color-accent)]' : 'bg-[var(--color-faint)] text-transparent'}`} />
          NYSE {state.open ? 'živě' : 'spí'}
        </span>
        {state.open ? (
          <span class="truncate">
            Za <span class="num">{clock(elapsed)}</span>, co jste tu, se zobchodovalo <span class="num font-semibold text-[var(--color-ink)]">{live(perSec * elapsed)}</span>
          </span>
        ) : (
          <span class="truncate">
            Otevře za <span class="num font-medium text-[var(--color-ink)]">{clock(state.opensIn)}</span>
            <span class="hidden sm:inline"> · pak se zobchoduje {czkShort(perSec)} každou sekundu</span>
          </span>
        )}
      </button>
      {info && (
        <div class="animate-fade absolute top-11 left-0 z-20 w-[min(88vw,380px)] rounded-2xl bg-white p-4 text-[13px] leading-relaxed text-[var(--color-ink-2)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35),0_0_0_1px_var(--color-line)]">
          Newyorská burza (NYSE) je největší na světě. Ve {etfCount} fondech, které tu srovnáváme, se během obchodování (15:30–22:00 našeho času) protočí průměrně <strong class="text-[var(--color-ink)]">{czkShort(perSec)} každou sekundu</strong>. Počítáno z průměrného objemu obchodů za poslední 3 měsíce (Alpha Vantage) a kurzu ČNB.
        </div>
      )}
    </div>
  );
}
