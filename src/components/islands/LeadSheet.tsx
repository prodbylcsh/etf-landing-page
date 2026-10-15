// Bottom sheet s formulářem – otevírá se ze zámků a výsledků kalkulaček (moment nejvyšší zvědavosti).
import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $sheet } from '../../lib/store';
import { track } from '../../lib/track';
import LeadForm from './LeadForm';
import { IconChecklist, IconSheet, IconSwap } from '../icons';

const ITEMS = [
  [IconSwap, 'Které ETF koupit a kde', '12 fondů, které v Česku opravdu koupíte'],
  [IconChecklist, 'Checklist pro začátečníky', '10 kroků bez drahých chyb'],
  [IconSheet, 'Excel plán „Kolik budu mít“', 'stačí zadat měsíční částku'],
] as const;

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
      <button class="animate-fade absolute inset-0 bg-black/40 backdrop-blur-sm" aria-label="Zavřít" onClick={() => close('backdrop')} />
      <div class="animate-sheet relative w-full max-w-lg rounded-t-[28px] bg-white px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px] sm:p-8">
        <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--color-line)] sm:hidden" />
        <button class="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-xl text-[var(--color-muted)] transition-colors hover:bg-[var(--color-soft)]" onClick={() => close('x')} aria-label="Zavřít">
          ×
        </button>
        <p class="eyebrow">Startovací balíček · zdarma</p>
        <h2 id="sheet-title" class="mt-2 pr-8 text-[1.6rem] leading-[1.1]">
          {ctx.headline ?? 'Návod, checklist a Excel plán vám pošleme do e-mailu'}
        </h2>
        <ul class="mt-5 space-y-3">
          {ITEMS.map(([Icon, t, d], i) => (
            <li class="animate-fade flex items-center gap-3" style={{ animationDelay: `${120 + i * 70}ms` }}>
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft)]">
                <Icon size={20} />
              </span>
              <span class="leading-tight">
                <span class="block text-[15px] font-medium">{t}</span>
                <span class="text-[13px] text-[var(--color-muted)]">{d}</span>
              </span>
            </li>
          ))}
        </ul>
        <div class="mt-6">
          <LeadForm placement={`sheet_${ctx.source}`} cta="Poslat zdarma" autoFocus onDone={() => setTimeout(() => $sheet.set(null), 3200)} />
        </div>
      </div>
    </div>
  );
}
