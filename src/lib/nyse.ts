// Obchodní hodiny NYSE (9:30–16:00 New York) a svátky. Zdroj: nyse.com/markets/hours-calendars
const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
  '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24',
]);
const OPEN = 9.5 * 3600;
const CLOSE = 16 * 3600;

function nyParts(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23' })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, wd: p.weekday as string, sec: +p.hour * 3600 + +p.minute * 60 + +p.second };
}

const tradingDay = (date: string, wd: string) => wd !== 'Sat' && wd !== 'Sun' && !HOLIDAYS.has(date);

/** {open:true} nebo {open:false, opensIn: sekundy do otevření} */
export function marketState(now = new Date()): { open: boolean; opensIn: number } {
  const { date, wd, sec } = nyParts(now);
  if (tradingDay(date, wd) && sec >= OPEN && sec < CLOSE) return { open: true, opensIn: 0 };
  let wait = tradingDay(date, wd) && sec < OPEN ? OPEN - sec : 24 * 3600 - sec + OPEN;
  for (let i = 0; i < 10; i++) {
    const probe = nyParts(new Date(now.getTime() + wait * 1000));
    if (tradingDay(probe.date, probe.wd)) break;
    wait += 24 * 3600;
  }
  return { open: false, opensIn: wait };
}

export function clock(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m}:${String(ss).padStart(2, '0')}`;
}
