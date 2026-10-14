// Burzovní pruh: kolik peněz se protočilo ve sledovaných ETF z NYSE za dobu, co je návštěvník na stránce.
// Tempo = průměrný denní objem v USD (reálná data) / délka seance × kurz ČNB.
import { useEffect, useRef, useState } from 'preact/hooks';
import { czkShort, fmtInt } from '../../lib/format';
import { track } from '../../lib/track';

interface Props {
  avgDailyUsd: number;
  etfCount: number;
  usdczk: number;
  method: string;
  asOf: string | null;
}

// Svátky NYSE (burza zavřená). Zdroj: nyse.com/markets/hours-calendars
const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
  '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24',
]);

function nyParts(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23' })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, wd: p.weekday as string, sec: +p.hour * 3600 + +p.minute * 60 + +p.second };
}

const OPEN = 9.5 * 3600;
const CLOSE = 16 * 3600;

function isTradingDay(date: string, wd: string) {
  return wd !== 'Sat' && wd !== 'Sun' && !HOLIDAYS.has(date);
}

/** Vrací {open:true} nebo {open:false, opensIn: sekundy}. */
function marketState(now: Date): { open: boolean; opensIn: number } {
  const { date, wd, sec } = nyParts(now);
  if (isTradingDay(date, wd) && sec >= OPEN && sec < CLOSE) return { open: true, opensIn: 0 };
  // Najdi příští otevření (max. 10 dní dopředu), krok po hodinách je zbytečný – stačí po dnech.
  let wait = isTradingDay(date, wd) && sec < OPEN ? OPEN - sec : 24 * 3600 - sec + OPEN;
  for (let i = 0; i < 10; i++) {
    const probe = nyParts(new Date(now.getTime() + wait * 1000));
    if (isTradingDay(probe.date, probe.wd)) break;
    wait += 24 * 3600;
  }
  return { open: false, opensIn: wait };
}

const clock = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m}:${String(ss).padStart(2, '0')}`;
};

export default function TickerBar({ avgDailyUsd, etfCount, usdczk, method, asOf }: Props) {
  const perSecCzk = (avgDailyUsd / 23400) * usdczk;
  const start = useRef(performance.now());
  const [elapsed, setElapsed] = useState(0);
  const [state, setState] = useState(() => marketState(new Date()));
  const [info, setInfo] = useState(false);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 90) {
        last = t;
        setElapsed((t - start.current) / 1000);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const id = setInterval(() => setState(marketState(new Date())), 1000);
    track('ticker_seen', { market_open: state.open }, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  if (!avgDailyUsd) return null;
  const traded = perSecCzk * elapsed;

  return (
    <div class="terminal !rounded-none text-[13px] leading-none" role="status" aria-live="off">
      <button
        type="button"
        class="mx-auto flex h-9 w-full max-w-6xl items-center gap-2.5 px-4 text-left"
        onClick={() => {
          setInfo(!info);
          track('ticker_info', { open: !info });
        }}
        aria-expanded={info}
        data-track="ticker"
      >
        {state.open ? (
          <>
            <span class="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-[var(--color-phosphor)]">
              <span class="inline-block h-2 w-2 rounded-full bg-[var(--color-phosphor)] shadow-[0_0_8px_var(--color-phosphor)]" />
              NYSE
            </span>
            <span class="num truncate font-semibold text-white">+{fmtInt(traded)} Kč</span>
            <span class="truncate text-[#9db0a7]">
              <span class="hidden sm:inline">protočeno ve {etfCount} ETF </span>za {clock(elapsed)}, co jste tu
            </span>
          </>
        ) : (
          <>
            <span class="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-[var(--color-amber)]">
              <span class="inline-block h-2 w-2 rounded-full bg-[var(--color-amber)]" />
              NYSE&nbsp;SPÍ
            </span>
            <span class="truncate text-[#c9d4ce]">
              otevře za <span class="num text-white">{clock(state.opensIn)}</span>
              <span class="text-[#9db0a7]"> · pak {czkShort(perSecCzk * 60)}/min</span>
            </span>
          </>
        )}
        <span class="ml-auto shrink-0 font-mono text-[11px] text-[#9db0a7]" aria-hidden="true">
          {info ? '×' : 'ⓘ'}
        </span>
      </button>
      {info && (
        <div class="mx-auto max-w-6xl px-4 pb-3 text-[12.5px] leading-snug text-[#c9d4ce]">
          Tempo obchodování ve {etfCount} sledovaných ETF z NYSE: průměrně{' '}
          <span class="num text-white">{czkShort(perSecCzk)}</span> za sekundu obchodní seance
          (9:30–16:00 v New Yorku = 15:30–22:00 u nás). {method} Kurz USD/CZK {String(usdczk).replace('.', ',')} (ČNB).
          {asOf && <> Data k {asOf.split('-').reverse().join('. ')}.</>} Zdroj: Alpha Vantage, ČNB.
        </div>
      )}
    </div>
  );
}
