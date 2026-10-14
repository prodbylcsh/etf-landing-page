#!/usr/bin/env node
// Stáhne reálná tržní data a uloží je do src/data/market.json.
//
// Zdroje:
//   - Alpha Vantage: LISTING_STATUS (burza kotace), ETF_PROFILE (TER, aktiva, dividendy),
//     TIME_SERIES_MONTHLY_ADJUSTED (měsíční ceny vč. dividend, objemy)
//   - ČNB: kurzy devizového trhu (aktuální + historické měsíční USD/CZK)
//
// Free tier Alpha Vantage = 25 dotazů/den, proto je skript inkrementální:
// obnovuje nejstarší položky v rámci rozpočtu a výsledky slučuje s existujícím souborem.
//
// Použití: ALPHAVANTAGE_API_KEY=xxx node scripts/fetch-data.mjs [--budget 25] [--force-profiles]

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/market.json');
const UNIVERSE = path.join(ROOT, 'src/data/universe.json');

const args = process.argv.slice(2);
const argVal = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const KEY = process.env.ALPHAVANTAGE_API_KEY || '';
let budget = Number(argVal('--budget', 25));
const FORCE_PROFILES = args.includes('--force-profiles');
const AV_DELAY_MS = Number(process.env.AV_DELAY_MS ?? 13000); // ≤ 5 dotazů/min
const HISTORY_FROM = '2005-01';
const NYSE_EXCHANGES = ['NYSE', 'NYSE ARCA', 'NYSE MKT'];
const DAY = 24 * 3600 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);
const log = (...a) => console.log('[data]', ...a);

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function http(url, { retries = 3 } = {}) {
  for (let i = 0; ; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'bestbrookies-data/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.text();
    } catch (err) {
      if (i >= retries) throw err;
      await sleep(2000 * 2 ** i);
    }
  }
}

// ---------------------------------------------------------------- Alpha Vantage

let lastAvCall = 0;
class BudgetExhausted extends Error {}

async function av(params) {
  if (!KEY) throw new BudgetExhausted('Chybí ALPHAVANTAGE_API_KEY');
  if (budget <= 0) throw new BudgetExhausted('Vyčerpán denní rozpočet dotazů');
  const wait = lastAvCall + AV_DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastAvCall = Date.now();
  budget--;
  const qs = new URLSearchParams({ ...params, apikey: KEY });
  const text = await http(`https://www.alphavantage.co/query?${qs}`);
  if (params.datatype === 'csv' || params.function === 'LISTING_STATUS') {
    if (text.trim().startsWith('{')) throw new BudgetExhausted(text.slice(0, 200));
    return text;
  }
  const json = JSON.parse(text);
  const msg = json.Note || json.Information || json['Error Message'];
  if (msg) {
    if (/rate limit|premium|call frequency|requests per day/i.test(msg)) throw new BudgetExhausted(msg);
    throw new Error(`Alpha Vantage: ${msg}`);
  }
  return json;
}

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function fetchListing() {
  const csv = await av({ function: 'LISTING_STATUS' });
  const lines = csv.trim().split(/\r?\n/).slice(1);
  const counts = {};
  const bySymbol = {};
  for (const line of lines) {
    const [symbol, , exchange, assetType] = line.split(',');
    if (assetType !== 'ETF') continue;
    counts[exchange] = (counts[exchange] || 0) + 1;
    bySymbol[symbol] = exchange;
  }
  const nyse = NYSE_EXCHANGES.reduce((s, ex) => s + (counts[ex] || 0), 0);
  return { counts, nyseEtfCount: nyse, bySymbol, asOf: today() };
}

async function fetchProfile(ticker) {
  const j = await av({ function: 'ETF_PROFILE', symbol: ticker });
  return {
    ter: num(j.net_expense_ratio),
    netAssets: num(j.net_assets),
    dividendYield: num(j.dividend_yield),
    inception: j.inception_date || null,
    sectors: (j.sectors || [])
      .map((s) => ({ name: s.sector, weight: num(s.weight) }))
      .filter((s) => s.weight > 0)
      .slice(0, 6),
    holdings: (j.holdings || [])
      .slice(0, 5)
      .map((h) => ({ symbol: h.symbol, name: h.description, weight: num(h.weight) })),
    holdingsCount: Array.isArray(j.holdings) ? j.holdings.length : null,
    asOf: (j.last_updated || today()).slice(0, 10),
  };
}

async function fetchMonthly(ticker) {
  const j = await av({ function: 'TIME_SERIES_MONTHLY_ADJUSTED', symbol: ticker });
  const series = j['Monthly Adjusted Time Series'];
  if (!series) throw new Error(`Chybí měsíční řada pro ${ticker}`);
  const rows = Object.entries(series)
    .map(([date, v]) => ({
      date,
      close: num(v['4. close']),
      adj: num(v['5. adjusted close']),
      volume: num(v['6. volume']),
    }))
    .filter((r) => r.date.slice(0, 7) >= HISTORY_FROM && r.adj)
    .sort((a, b) => a.date.localeCompare(b.date));
  return { rows, lastRefreshed: j['Meta Data']?.['3. Last Refreshed'] || rows.at(-1)?.date };
}

// ---------------------------------------------------------------- Odvozené metriky

function weekdaysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  let n = 0;
  for (let d = 1; d <= days; d++) {
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (wd !== 0 && wd !== 6) n++;
  }
  return n;
}

function derive(rows) {
  // Poslední řádek je obvykle rozpracovaný měsíc; výnosy počítáme k poslednímu ukončenému měsíci.
  const lastIsPartial = rows.length > 1 && isCurrentMonth(rows.at(-1).date);
  const complete = lastIsPartial ? rows.slice(0, -1) : rows;
  const end = complete.at(-1);
  const back = (months) => complete[complete.length - 1 - months];
  const ret = (months) => {
    const start = back(months);
    if (!start) return null;
    const total = end.adj / start.adj;
    const years = months / 12;
    return years > 1 ? total ** (1 / years) - 1 : total - 1;
  };
  // Průměrný denní objem v USD za poslední 3 ukončené měsíce.
  const last3 = complete.slice(-3);
  const dollar = last3.reduce((s, r) => s + r.volume * r.close, 0);
  const days = last3.reduce((s, r) => s + weekdaysInMonth(r.date.slice(0, 7)), 0);
  return {
    returns: { y1: ret(12), y5: ret(60), y10: ret(120), y20: ret(240), asOf: end.date },
    dollarVolume: { avgDailyUsd: Math.round(dollar / days), months: last3.map((r) => r.date.slice(0, 7)) },
    monthly: rows.map((r) => [r.date.slice(0, 7), Math.round(r.adj * 10000) / 10000]),
    lastPrice: { close: rows.at(-1).close, date: rows.at(-1).date },
  };
}

function isCurrentMonth(date) {
  return date.slice(0, 7) === today().slice(0, 7);
}

// ---------------------------------------------------------------- ČNB

const CNB = 'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu';
const czNum = (s) => Number(String(s).replace(',', '.'));

async function fetchFx(prev) {
  const daily = await http(`${CNB}/denni_kurz.txt`);
  const [head, , ...lines] = daily.trim().split(/\r?\n/);
  const usd = lines.map((l) => l.split('|')).find((c) => c[3] === 'USD');
  const [d, m, y] = head.split(' ')[0].split('.');
  const current = { usdczk: czNum(usd[4]), date: `${y}-${m}-${d}` };

  // Měsíční kurz = poslední fixing v měsíci. Uzavřené roky se nemění, stáhneme jen chybějící.
  const monthly = { ...(prev?.monthly || {}) };
  const startYear = Number(HISTORY_FROM.slice(0, 4));
  const thisYear = new Date().getUTCFullYear();
  for (let year = startYear; year <= thisYear; year++) {
    const have = Object.keys(monthly).some((k) => k.startsWith(`${year}-12`));
    if (have && year < thisYear) continue;
    const txt = await http(`${CNB}/rok.txt?rok=${year}`);
    let col = -1;
    let amount = 1;
    for (const line of txt.trim().split(/\r?\n/)) {
      const cells = line.split('|');
      if (cells[0] === 'Datum') {
        col = cells.findIndex((c) => c.endsWith(' USD'));
        amount = Number(cells[col]?.split(' ')[0] || 1);
        continue;
      }
      if (col < 0) continue;
      const [, mm, yyyy] = cells[0].split('.');
      monthly[`${yyyy}-${mm}`] = Math.round((czNum(cells[col]) / amount) * 1000) / 1000;
    }
    await sleep(300);
  }
  return {
    ...current,
    monthly,
    source: 'ČNB – kurzy devizového trhu',
    sourceUrl: `${CNB}/denni_kurz.txt`,
  };
}

// ---------------------------------------------------------------- Main

async function main() {
  const universe = await readJson(UNIVERSE, null);
  const prev = await readJson(OUT, {});
  const out = {
    generatedAt: new Date().toISOString(),
    sources: {
      alphaVantage: { name: 'Alpha Vantage', url: 'https://www.alphavantage.co/documentation/' },
      cnb: { name: 'Česká národní banka', url: `${CNB}/denni_kurz.txt` },
    },
    fx: prev.fx || null,
    listing: prev.listing || null,
    etfs: prev.etfs || {},
  };

  try {
    out.fx = await fetchFx(prev.fx);
    log(`ČNB USD/CZK ${out.fx.usdczk} (${out.fx.date}), ${Object.keys(out.fx.monthly).length} měsíců`);
  } catch (err) {
    log('ČNB selhala, ponechávám předchozí kurzy:', err.message);
  }

  const tickers = universe.etfs.map((e) => e.ticker);
  const tasks = [];
  const age = (d) => (d ? Date.now() - new Date(d).getTime() : Infinity);

  if (!out.listing || age(out.listing.asOf) > 6 * DAY) tasks.push({ kind: 'listing' });
  // Ceny: nejstarší napřed. Profily: jednou týdně (nebo při --force-profiles).
  const byPriceAge = [...tickers].sort((a, b) => age(out.etfs[b]?.fetched?.prices) - age(out.etfs[a]?.fetched?.prices));
  for (const t of byPriceAge) {
    if (age(out.etfs[t]?.fetched?.prices) > 20 * 3600 * 1000) tasks.push({ kind: 'prices', t });
  }
  for (const t of tickers) {
    if (FORCE_PROFILES || age(out.etfs[t]?.fetched?.profile) > 6 * DAY) tasks.push({ kind: 'profile', t });
  }
  log(`Naplánováno ${tasks.length} dotazů, rozpočet ${budget}`);

  for (const task of tasks) {
    try {
      if (task.kind === 'listing') {
        const l = await fetchListing();
        out.listing = { counts: l.counts, nyseEtfCount: l.nyseEtfCount, asOf: l.asOf, exchanges: {} };
        for (const t of tickers) out.listing.exchanges[t] = l.bySymbol[t] || null;
        log(`Listing: ${l.nyseEtfCount} ETF na burzách NYSE`);
      } else if (task.kind === 'prices') {
        const { rows, lastRefreshed } = await fetchMonthly(task.t);
        const e = (out.etfs[task.t] ||= {});
        Object.assign(e, derive(rows), { lastRefreshed });
        (e.fetched ||= {}).prices = new Date().toISOString();
        log(`${task.t}: ${rows.length} měsíců, poslední ${lastRefreshed}`);
      } else if (task.kind === 'profile') {
        const p = await fetchProfile(task.t);
        const e = (out.etfs[task.t] ||= {});
        e.profile = p;
        (e.fetched ||= {}).profile = new Date().toISOString();
        log(`${task.t}: TER ${p.ter}, aktiva ${p.netAssets}`);
      }
    } catch (err) {
      if (err instanceof BudgetExhausted) {
        log('Stop:', err.message);
        break;
      }
      log(`Chyba (${task.kind} ${task.t || ''}):`, err.message);
    }
  }

  // Souhrn pro burzovní pruh: součet průměrných denních objemů sledovaných ETF.
  const vols = tickers.map((t) => out.etfs[t]?.dollarVolume?.avgDailyUsd).filter(Boolean);
  out.ticker = {
    avgDailyUsd: vols.reduce((a, b) => a + b, 0),
    etfCount: vols.length,
    sessionSeconds: 23400,
    method:
      'Součet průměrného denního objemu obchodů v USD (objem × závěrečná cena) sledovaných ETF za poslední 3 ukončené měsíce, vydělený počtem obchodních dní a délkou seance NYSE (6,5 h).',
  };

  const missing = tickers.filter((t) => !out.etfs[t]?.monthly || !out.etfs[t]?.profile);
  out.complete = missing.length === 0;
  if (missing.length) log('Zatím chybí data pro:', missing.join(', '));

  await writeFile(OUT, JSON.stringify(out, null, 1) + '\n');
  log(`Uloženo ${path.relative(ROOT, OUT)} (zbývající rozpočet ${budget})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
