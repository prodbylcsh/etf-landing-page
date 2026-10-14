// Nenápadná lišta se souhlasem. Analytika bez cookies běží vždy; marketingové cookies (Meta) jen po souhlasu.
import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $consent, setConsent } from '../../lib/track';

export default function ConsentBar() {
  const consent = useStore($consent);
  // Lištu ukážeme až po prvním scrollu nebo po 8 s: hero zůstane volný. Před souhlasem se nic neukládá.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const show = () => setReady(true);
    const onScroll = () => scrollY > 250 && show();
    addEventListener('scroll', onScroll, { passive: true });
    const id = setTimeout(show, 8000);
    return () => {
      removeEventListener('scroll', onScroll);
      clearTimeout(id);
    };
  }, []);
  if (consent !== null || !ready) return null;
  return (
    <div class="fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:right-auto md:bottom-4 md:left-4 md:max-w-sm md:p-0" role="region" aria-label="Souhlas s cookies">
      <div class="animate-sheet flex flex-col gap-3 rounded-3xl bg-white p-4 text-[13px] leading-snug shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3),0_0_0_1px_var(--color-line)]">
        <p class="text-[var(--color-ink-2)]">
          Návštěvnost měříme bez cookies. Smíme použít i cookies pro vyhodnocení reklam?{' '}
          <a href="/ochrana-udaju#cookies" class="underline underline-offset-2">
            Podrobnosti
          </a>
        </p>
        <div class="flex gap-2">
          <button class="btn btn-primary h-10 min-h-0 flex-1" onClick={() => setConsent('granted')}>
            Povolit
          </button>
          <button class="btn btn-ghost h-10 min-h-0 flex-1" onClick={() => setConsent('denied')}>
            Jen nezbytné
          </button>
        </div>
      </div>
    </div>
  );
}
