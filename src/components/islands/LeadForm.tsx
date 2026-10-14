// Formulář pro získání kontaktu: 1 povinné pole (e-mail) + volitelný souhlas se sérií e-mailů.
import { useEffect, useRef, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $context, $unlocked } from '../../lib/store';
import { $consent, getVariant, identifyLead, track, trackMetaLead } from '../../lib/track';
import { PDF_URL, XLSX_URL } from '../../lib/config';
import { IconCheck, IconChecklist, IconSheet } from '../icons';

interface Props {
  placement: string;
  cta?: string;
  dark?: boolean;
  showConsent?: boolean;
  autoFocus?: boolean;
  onDone?: () => void;
}

type Status = 'idle' | 'sending' | 'error' | 'done';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const uid = () => (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function LeadForm({ placement, cta = 'Poslat balíček', dark = false, showConsent = true, autoFocus = false, onDone }: Props) {
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
    if (autoFocus) setTimeout(() => input.current?.focus({ preventScroll: true }), 400);
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

  const muted = dark ? 'text-zinc-400' : 'text-[var(--color-muted)]';

  if (status === 'done' || (unlocked && status === 'idle')) {
    return (
      <div class={`animate-pop rounded-3xl p-5 ${dark ? 'bg-[var(--color-dark-2)] text-white' : 'bg-[var(--color-accent-soft)]'}`} data-form-placement={`${placement}_done`}>
        <p class="flex items-start gap-2.5 font-medium">
          <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
            <IconCheck size={14} />
          </span>
          {status === 'done' ? (
            <span>
              Hotovo. Balíček letí na <span class="break-all">{sentTo}</span> a dvojčata jsou odemčená.
            </span>
          ) : (
            <span>Balíček už máte. Dvojčata jsou odemčená.</span>
          )}
        </p>
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <a class="btn btn-primary" href={PDF_URL} download onClick={() => track('pdf_download', { placement })} data-track="pdf_download">
            <IconChecklist size={18} /> Checklist (PDF)
          </a>
          <a class={`btn ${dark ? 'bg-white text-[var(--color-ink)]' : 'bg-white'}`} href={XLSX_URL} download onClick={() => track('xlsx_download', { placement })} data-track="xlsx_download">
            <IconSheet size={18} /> Šablona (Excel)
          </a>
        </div>
        <button
          type="button"
          class={`mt-3 text-[13px] underline underline-offset-4 ${muted}`}
          onClick={async () => {
            track('share_click', { placement });
            const d = { title: 'Startovací balíček ETF – BestBrookies', text: 'Americká ETF a jejich evropská dvojčata + checklist:', url: location.origin + '/?utm_source=share' };
            try {
              if (navigator.share) await navigator.share(d);
              else {
                await navigator.clipboard.writeText(d.url);
                alert('Odkaz zkopírován.');
              }
            } catch {}
          }}
        >
          Poslat odkaz kamarádovi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate class="w-full" data-form-placement={placement}>
      <div class={`flex flex-col gap-2 rounded-[28px] p-1.5 sm:flex-row sm:items-center ${dark ? 'bg-[var(--color-dark-2)] ring-1 ring-[var(--color-dark-line)]' : 'bg-white shadow-[0_0_0_1px_var(--color-line),0_10px_30px_-18px_rgba(0,0,0,0.25)]'} transition-shadow focus-within:shadow-[0_0_0_1px_var(--color-ink),0_10px_30px_-14px_rgba(0,0,0,0.35)]`}>
        <label class="sr-only" for={`email-${placement}`}>
          Váš e-mail
        </label>
        <input
          ref={input}
          id={`email-${placement}`}
          class={`min-h-[50px] flex-1 rounded-full bg-transparent px-4 text-[17px] outline-none ${dark ? 'text-white placeholder:text-zinc-500' : 'placeholder:text-[var(--color-faint)]'}`}
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
        <input type="text" name="company" tabIndex={-1} autoComplete="off" class="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
        <button type="submit" class={`btn ${dark ? 'btn-accent' : 'btn-primary'} min-h-[50px]`} disabled={status === 'sending'} data-track={`submit_${placement}`}>
          {status === 'sending' ? 'Odesílám…' : cta}
          {status !== 'sending' && <span class="arr">→</span>}
        </button>
      </div>
      {status === 'error' && (
        <p class="animate-fade mt-2 px-4 text-sm font-medium text-[var(--color-neg)]" role="alert">
          {error}
        </p>
      )}
      {showConsent && (
        <label class={`mt-3 flex cursor-pointer items-start gap-2.5 px-2 text-[13px] leading-snug ${muted}`}>
          <input type="checkbox" class="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--color-ink)]" checked={marketing} onChange={(e) => setMarketing((e.target as HTMLInputElement).checked)} />
          <span>Chci i krátkou sérii e-mailů o ETF a daních (max. 1× týdně, odhlášení jedním klikem).</span>
        </label>
      )}
      <p id={`note-${placement}`} class={`mt-2 px-2 text-[12.5px] leading-snug ${muted}`}>
        Zdarma. Žádný spam, žádné telefonáty.{' '}
        <a href="/ochrana-udaju" class="underline underline-offset-2">
          Ochrana údajů
        </a>
      </p>
    </form>
  );
}
