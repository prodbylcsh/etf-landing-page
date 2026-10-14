// Hero varianta A („dvojče“): tap na ticker → okamžitě „v ČR nekoupíte“ → dvojče (VOO zdarma, ostatní zamčená).
import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $unlocked, openLead } from '../../lib/store';
import { track } from '../../lib/track';
import { ter } from '../../lib/format';
import type { EtfLite } from '../../lib/market';

interface Props {
  etfs: EtfLite[];
  tickers: string[];
}

export default function HeroTwin({ etfs, tickers }: Props) {
  const [sel, setSel] = useState(tickers[0]);
  const [stampKey, setStampKey] = useState(0);
  const unlocked = useStore($unlocked);
  const etf = etfs.find((e) => e.ticker === sel)!;
  const open = unlocked || etf.twin.free;

  return (
    <div class="rounded-2xl bg-[var(--color-card)] p-3.5 ring-1 ring-[var(--color-rule)]">
      <div class="flex items-center justify-between gap-2">
        <p class="kicker">Vyberte ETF, které znáte</p>
        <p class="kicker hidden sm:block">↓ dvojče</p>
      </div>
      <div class="scroll-x -mx-1 mt-2 flex gap-2 px-1 pb-1" role="group" aria-label="Vyberte ETF">
        {tickers.map((t) => (
          <button
            type="button"
            class="chip shrink-0"
            aria-pressed={t === sel}
            data-track="hero_chip"
            onClick={() => {
              setSel(t);
              setStampKey((k) => k + 1);
              track('hero_chip_click', { ticker: t });
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div class="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2">
        {/* USA */}
        <div class="relative overflow-hidden rounded-xl bg-[var(--color-paper-2)] p-3">
          <p class="kicker">NYSE · USA</p>
          <p class="num mt-1 text-2xl font-bold">{etf.ticker}</p>
          <p class="mt-0.5 truncate text-[12.5px] leading-tight text-[var(--color-muted)]">{etf.nameCz}</p>
          <span key={stampKey} class="stamp animate-stamp mt-2 text-[10px]">
            v ČR nekoupíte
          </span>
        </div>
        <div class="flex items-center text-xl text-[var(--color-muted)]" aria-hidden="true">
          →
        </div>
        {/* Evropa */}
        <div class="terminal relative overflow-hidden p-3">
          <p class="kicker !text-[var(--color-phosphor)]">Dvojče · EU ✓</p>
          {open ? (
            <div key={sel} class="animate-rise">
              <p class="num mt-1 text-2xl font-bold text-white">{etf.twin.ticker?.split(' / ')[0] ?? 'ISIN'}</p>
              <p class="mt-0.5 line-clamp-2 text-[12.5px] leading-tight text-[#b9c7c0]">
                TER {ter(etf.twin.ter)} · {etf.twin.match === 'exact' ? 'stejný index' : 'nejbližší'}
              </p>
            </div>
          ) : (
            <button
              type="button"
              class="block w-full text-left"
              data-track="hero_lock"
              onClick={() => {
                track('lock_click', { where: 'hero', ticker: etf.ticker });
                openLead({ source: 'hero_lock', tickers: [etf.ticker], headline: `Dvojče k ${etf.ticker} a dalším 11 ETF vám pošleme do e-mailu` });
              }}
            >
              <p class="num locked-blur mt-1 text-2xl font-bold text-white" aria-hidden="true">
                XXXX
              </p>
              <p class="mt-0.5 flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-amber)]">🔒 Odemknout</p>
            </button>
          )}
        </div>
      </div>
      <p class="mt-2.5 text-[13px] leading-snug text-[var(--color-muted)]">
        {etf.twin.free && !unlocked ? (
          <>
            Dvojče k {etf.ticker} vidíte zdarma. <span class="font-semibold text-[var(--color-ink)]">Zbylých 11 je v taháku.</span>
          </>
        ) : (
          etf.twin.note
        )}
      </p>
    </div>
  );
}
