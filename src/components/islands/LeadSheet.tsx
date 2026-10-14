// Bottom sheet s formulářem – otevírá se z „zámků“ a výsledků kalkulaček (moment nejvyšší zvědavosti).
import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $sheet } from '../../lib/store';
import { track } from '../../lib/track';
import LeadForm from './LeadForm';

export default function LeadSheet() {
  const ctx = useStore($sheet);

  useEffect(() => {
    if (!ctx) return;
    track('sheet_open', { source: ctx.source });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close('esc');
    addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [ctx]);

  function close(how: string) {
    track('sheet_close', { how, source: $sheet.get()?.source });
    $sheet.set(null);
  }

  if (!ctx) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button class="absolute inset-0 bg-[rgba(21,23,26,0.55)] backdrop-blur-[2px]" aria-label="Zavřít" onClick={() => close('backdrop')} />
      <div class="animate-sheet relative w-full max-w-lg rounded-t-2xl bg-[var(--color-paper)] px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-7">
        <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--color-rule)] sm:hidden" />
        <button class="absolute top-2 right-2 flex h-11 w-11 items-center justify-center text-2xl text-[var(--color-muted)]" onClick={() => close('x')} aria-label="Zavřít">
          ×
        </button>
        <p class="kicker">ETF tahák 2026 · PDF zdarma</p>
        <h2 id="sheet-title" class="mt-1 pr-8 text-[1.6rem] leading-[1.1] font-semibold">
          {ctx.headline ?? 'Pošleme vám všechna dvojčata v jednom PDF'}
        </h2>
        <ul class="mt-3 space-y-1.5 text-[15px] text-[var(--color-ink-2)]">
          <li>✓ 12 ETF z NYSE → co si koupíte v Česku (ISIN, poplatek)</li>
          <li>✓ Kolik vás stojí poplatky za 10, 20 a 30 let</li>
          <li>✓ Daně v ČR na jedné stránce (časový test, DIP)</li>
        </ul>
        <div class="mt-4">
          <LeadForm placement={`sheet_${ctx.source}`} cta="Odemknout a poslat" autoFocus onDone={() => setTimeout(() => $sheet.set(null), 2600)} />
        </div>
      </div>
    </div>
  );
}
