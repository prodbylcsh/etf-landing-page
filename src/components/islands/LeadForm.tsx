// Formulář pro získání kontaktu: 1 povinné pole (e-mail) + volitelný souhlas s e-mailovou sérií.
import { useEffect, useRef, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $context, $unlocked } from '../../lib/store';
import { $consent, getVariant, identifyLead, track, trackMetaLead } from '../../lib/track';

export const PDF_URL = '/bestbrookies-etf-tahak-2026.pdf';

interface Props {
  placement: string;
  cta?: string;
  /** Tmavá varianta (uvnitř terminálového bloku) */
  dark?: boolean;
  /** Skrýt checkbox (např. v hero kvůli místu – souhlas lze dát i později) */
  showConsent?: boolean;
  autoFocus?: boolean;
  onDone?: () => void;
}

type Status = 'idle' | 'sending' | 'error' | 'done';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function uid() {
  return (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function LeadForm({ placement, cta = 'Poslat tahák zdarma', dark = false, showConsent = true, autoFocus = false, onDone }: Props) {
  const unlocked = useStore($unlocked);
  const [email, setEmail] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const mountedAt = useRef(Date.now());
  const focused = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) setTimeout(() => input.current?.focus({ preventScroll: true }), 350);
  }, []);

  async function submit(e: Event) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const hp = (form.elements.namedItem('company') as HTMLInputElement)?.value ?? '';
    const value = email.trim();
    track('form_submit', { placement, marketing });
    if (!EMAIL_RE.test(value)) {
      setStatus('error');
      setError('Zkontrolujte prosím e-mail, něco v něm chybí.');
      track('form_error', { placement, reason: 'invalid_email' });
      input.current?.focus();
      return;
    }
    setStatus('sending');
    setError('');
    const eventId = uid();
    try {
      const utm = JSON.parse(sessionStorage.getItem('bb_utm') || '{}');
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: value,
          marketing,
          placement,
          variant: getVariant(),
          context: $context.get(),
          utm,
          company: hp,
          elapsedMs: Date.now() - mountedAt.current,
          timeOnPageMs: Math.round(performance.now()),
          eventId,
          adConsent: $consent.get() === 'granted',
          page: location.href,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Odeslání se nepovedlo.');
      setSentTo(value);
      setStatus('done');
      $unlocked.set(true);
      identifyLead(value);
      trackMetaLead(eventId);
      track('lead_created', { placement, marketing, mock: Boolean(data.mock), source: $context.get().source });
      onDone?.();
    } catch (err: any) {
      setStatus('error');
      setError(err?.message?.length < 120 ? err.message : 'Odeslání se nepovedlo. Zkuste to prosím znovu.');
      track('form_error', { placement, reason: 'network' });
    }
  }

  const text = dark ? 'text-[#e8efe9]' : 'text-[var(--color-ink)]';
  const muted = dark ? 'text-[#9db0a7]' : 'text-[var(--color-muted)]';

  if (status === 'done' || (unlocked && status === 'idle')) {
    return (
      <div class={`animate-rise rounded-xl ${dark ? 'bg-[var(--color-term-2)]' : 'bg-[var(--color-card)] ring-1 ring-[var(--color-rule)]'} p-4`} data-form-placement={`${placement}_done`}>
        <p class={`flex items-start gap-2 font-semibold ${text}`}>
          <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-up)] text-[12px] text-white">✓</span>
          {status === 'done' ? (
            <span>
              Hotovo. Tahák letí na <span class="break-all">{sentTo}</span>. Dvojčata na stránce jsou odemčená.
            </span>
          ) : (
            <span>Tahák už máte. Dvojčata jsou odemčená.</span>
          )}
        </p>
        <div class="mt-3 flex flex-col gap-2 sm:flex-row">
          <a class="btn btn-primary sm:flex-1" href={PDF_URL} download onClick={() => track('pdf_download', { placement })} data-track="pdf_download">
            Stáhnout PDF tahák
          </a>
          <button
            type="button"
            class={`btn ${dark ? 'border border-[#3a464b] text-[#e8efe9]' : 'btn-ghost'}`}
            onClick={async () => {
              track('share_click', { placement });
              const data = { title: 'ETF tahák 2026 – BestBrookies', text: 'Americká ETF a jejich česká dvojčata na jednom místě:', url: location.origin + '/?utm_source=share' };
              try {
                if (navigator.share) await navigator.share(data);
                else {
                  await navigator.clipboard.writeText(data.url);
                  alert('Odkaz zkopírován.');
                }
              } catch {}
            }}
          >
            Poslat kamarádovi
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate class="w-full" data-form-placement={placement}>
      <div class="flex flex-col gap-2 sm:flex-row">
        <label class="sr-only" for={`email-${placement}`}>
          Váš e-mail
        </label>
        <input
          ref={input}
          id={`email-${placement}`}
          class="field sm:flex-1"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellcheck={false}
          placeholder="vas@email.cz"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          onFocus={() => {
            if (!focused.current) track('form_focus', { placement });
            focused.current = true;
          }}
          aria-invalid={status === 'error'}
          aria-describedby={`note-${placement}`}
          required
        />
        {/* Honeypot – lidé ho nevidí, boti ho vyplní */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" class="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
        <button type="submit" class="btn btn-primary whitespace-nowrap" disabled={status === 'sending'} data-track={`submit_${placement}`}>
          {status === 'sending' ? 'Odesílám…' : cta}
          {status !== 'sending' && <span aria-hidden="true">→</span>}
        </button>
      </div>
      {status === 'error' && (
        <p class="mt-2 text-sm font-medium text-[var(--color-stamp)]" role="alert">
          {error}
        </p>
      )}
      {showConsent && (
        <label class={`mt-3 flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-snug ${muted}`}>
          <input type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-stamp)]" checked={marketing} onChange={(e) => setMarketing((e.target as HTMLInputElement).checked)} />
          <span>Chci i krátkou sérii e-mailů o ETF a daních (nejvýš 1× týdně, odhlásíte se jedním klikem).</span>
        </label>
      )}
      <p id={`note-${placement}`} class={`mt-2 text-[12.5px] leading-snug ${muted}`}>
        Tahák pošleme jen na tento e-mail. Žádný spam, žádné telefonáty.{' '}
        <a href="/ochrana-udaju" class="underline underline-offset-2">
          Ochrana údajů
        </a>
      </p>
    </form>
  );
}
