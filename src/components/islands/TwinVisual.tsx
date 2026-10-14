// Hero varianta A („dvojče“): výběr tickeru → karta USA (nekoupíte) → tok → karta EU (dvojče).
// VOO je odkryté zdarma jako důkaz hodnoty, ostatní dvojčata se odemknou e-mailem.
import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $unlocked, openLead } from '../../lib/store';
import { track } from '../../lib/track';
import { ter } from '../../lib/format';
import type { EtfLite } from '../../lib/market';
import { FlagEU, FlagUS, IconCheck, IconLock, IconX } from '../icons';

interface Props {
  etfs: EtfLite[];
  tickers: string[];
}

export default function TwinVisual({ etfs, tickers }: Props) {
  const [sel, setSel] = useState(tickers[0]);
  const unlocked = useStore($unlocked);
  const etf = etfs.find((e) => e.ticker === sel)!;
  const open = unlocked || etf.twin.free;
  const twinTicker = etf.twin.ticker?.split(' / ')[0] ?? etf.twin.isin;

  return (
    <div class="relative">
      {/* jemná záře v pozadí */}
      <div class="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(201,242,75,0.35),transparent)] blur-2xl" />

      <div class="flex justify-center">
        <div class="seg scroll-x max-w-full" role="group" aria-label="Vyberte ETF">
          {tickers.map((t) => (
            <button
              type="button"
              aria-pressed={t === sel}
              class="mono"
              data-track="hero_chip"
              onClick={() => {
                setSel(t);
                track('hero_chip_click', { ticker: t });
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div class="relative mx-auto mt-4 max-w-[440px] sm:mt-5">
        {/* USA */}
        <div key={`us-${sel}`} class="animate-fade card flex items-center gap-3.5 p-3.5 sm:gap-4 sm:p-5">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-soft)]">
            <FlagUS size={18} />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[12px] text-[var(--color-muted)]">NYSE · USA</p>
            <p class="mono text-[1.6rem] leading-tight font-semibold tracking-tight">{etf.ticker}</p>
            <p class="truncate text-[13px] text-[var(--color-muted)]">{etf.nameCz}</p>
          </div>
          <span class="animate-pop inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-neg-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-neg)]">
            <IconX size={13} /> v ČR ne
          </span>
        </div>

        {/* Tok peněz */}
        <div class="relative flex h-12 items-center justify-center sm:h-16" aria-hidden="true">
          <svg viewBox="0 0 20 64" preserveAspectRatio="none" class="absolute h-full w-5">
            <path d="M10 0 V64" stroke="var(--color-line)" stroke-width="2" stroke-dasharray="3 4" />
            {[0, 1, 2].map((i) => (
              <circle r="3" fill="var(--color-accent)" opacity="0">
                <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${-i * 0.8}s`} {...({ path: "M10 0 V64" } as any)} />
                <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" begin={`${-i * 0.8}s`} values="0;1;1;0" keyTimes="0;0.15;0.85;1" />
              </circle>
            ))}
          </svg>
          <span class="relative rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[var(--color-ink-2)] shadow-[0_0_0_1px_var(--color-line)]">
            {etf.twin.match === 'exact' ? 'stejný index' : 'nejbližší alternativa'}
          </span>
        </div>

        {/* EU dvojče */}
        <div key={`eu-${sel}-${open}`} class="animate-fade card-dark relative overflow-hidden p-3.5 sm:p-5">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-dark-2)]">
              <FlagEU size={18} />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[12px] text-zinc-400">Evropské dvojče · {etf.twin.match === 'exact' ? 'UCITS' : 'UCITS / ETC'}</p>
              {open ? (
                <>
                  <p class="mono text-[1.6rem] leading-tight font-semibold tracking-tight text-white">{twinTicker}</p>
                  <p class="truncate text-[13px] text-zinc-400">
                    TER {ter(etf.twin.ter)} · <span class="mono">{etf.twin.isin}</span>
                  </p>
                </>
              ) : (
                <>
                  <p class="locked mono text-[1.6rem] leading-tight font-semibold text-white" aria-hidden="true">
                    XXXX
                  </p>
                  <p class="locked text-[13px] text-zinc-400" aria-hidden="true">
                    TER 0,00 % · IE00XXXXXXXX
                  </p>
                </>
              )}
            </div>
            {open ? (
              <span class="animate-pop inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-lime)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-ink)]">
                <IconCheck size={13} /> koupíte
              </span>
            ) : null}
          </div>
          {!open && (
            <button
              type="button"
              class="btn btn-accent mt-4 w-full"
              data-track="hero_lock"
              onClick={() => {
                track('lock_click', { where: 'hero', ticker: etf.ticker });
                openLead({ source: 'hero_lock', tickers: [etf.ticker], headline: `Dvojče k ${etf.ticker} a dalších 11 ETF vám pošleme do e-mailu` });
              }}
            >
              <IconLock size={16} /> Odemknout dvojče k {etf.ticker}
            </button>
          )}
        </div>
      </div>

      <p class="mt-3 text-center text-[13px] text-[var(--color-muted)] sm:mt-4 sm:text-[13.5px]">
        {etf.twin.free && !unlocked ? (
          <>
            Dvojče k {etf.ticker} vidíte zdarma. <span class="text-[var(--color-ink)]">Dalších 11 je v balíčku.</span>
          </>
        ) : (
          etf.twin.note
        )}
      </p>
    </div>
  );
}
