// Nenápadná lišta se souhlasem. Analytika bez cookies běží vždy; marketingové cookies (Meta) jen po souhlasu.
import { useStore } from '@nanostores/preact';
import { $consent, setConsent } from '../../lib/track';

export default function ConsentBar() {
  const consent = useStore($consent);
  if (consent !== null) return null;
  return (
    <div class="fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:right-auto md:bottom-4 md:left-4 md:max-w-sm md:p-0" role="region" aria-label="Souhlas s cookies">
      <div class="terminal flex flex-col gap-3 p-3.5 text-[13.5px] leading-snug shadow-xl">
        <p class="text-[#c9d4ce]">
          Návštěvnost měříme bez cookies. Smíme použít i cookies pro vyhodnocení reklam?{' '}
          <a href="/ochrana-udaju#cookies" class="underline underline-offset-2">
            Podrobnosti
          </a>
        </p>
        <div class="flex gap-2">
          <button class="btn h-11 min-h-0 flex-1 bg-[var(--color-phosphor)] text-[var(--color-term)]" onClick={() => setConsent('granted')}>
            Povolit
          </button>
          <button class="btn h-11 min-h-0 flex-1 border border-[#3a464b] text-[#e8efe9]" onClick={() => setConsent('denied')}>
            Jen nezbytné
          </button>
        </div>
      </div>
    </div>
  );
}
