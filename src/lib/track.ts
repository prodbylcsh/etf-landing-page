// Měření celé cesty návštěvníka: příchod → interakce → formulář → lead.
//
// - Každá událost jde do window.dataLayer (GTM-kompatibilní) a do debug panelu (?debug=1).
// - PostHog (EU cloud) se načte líně, jen pokud je nastaven PUBLIC_POSTHOG_KEY.
//   Bez souhlasu s cookies běží v paměti (cookieless), po souhlasu persistuje.
// - Meta Pixel se načte až po souhlasu s marketingovými cookies.
import { atom } from 'nanostores';

const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com';
const META_PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID as string | undefined;

export type Consent = 'granted' | 'denied' | null;

export interface TrackedEvent {
  name: string;
  props: Record<string, unknown>;
  at: number;
}

export const $events = atom<TrackedEvent[]>([]);
export const $consent = atom<Consent>(readConsent());

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    __bbTrackInit?: boolean;
  }
}

let posthog: any = null;
const queue: [string, Record<string, unknown>][] = [];
const fired = new Set<string>();

function readConsent(): Consent {
  try {
    const v = localStorage.getItem('bb_consent');
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function getParam(name: string): string | null {
  try {
    return new URLSearchParams(location.search).get(name);
  } catch {
    return null;
  }
}

export function getVariant(): 'rust' | 'poplatky' {
  return document.documentElement.dataset.v === 'poplatky' ? 'poplatky' : 'rust';
}

function getUtm(): Record<string, string> {
  const KEY = 'bb_utm';
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
    const utm: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid']) {
      const v = getParam(k);
      if (v) utm[k] = v;
    }
    sessionStorage.setItem(KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
}

export function baseProps(): Record<string, unknown> {
  return {
    variant: getVariant(),
    ...getUtm(),
    device: matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
    t_since_load: Math.round(performance.now()),
  };
}

/** Zaznamená událost. `once` = jen jednou za načtení stránky (např. first_interaction). */
export function track(name: string, props: Record<string, unknown> = {}, opts: { once?: boolean } = {}) {
  if (typeof window === 'undefined') return;
  const key = opts.once ? name + JSON.stringify(props) : '';
  if (opts.once) {
    if (fired.has(key)) return;
    fired.add(key);
  }
  const payload = { ...baseProps(), ...props };
  (window.dataLayer ||= []).push({ event: name, ...payload });
  $events.set([...$events.get().slice(-199), { name, props: payload, at: Date.now() }]);
  if (posthog) posthog.capture(name, payload);
  else queue.push([name, payload]);
  if (import.meta.env.DEV) console.debug('[track]', name, payload);
}

export function setConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem('bb_consent', value);
  } catch {}
  $consent.set(value);
  track('consent_update', { consent: value });
  applyConsent();
}

function applyConsent() {
  const granted = $consent.get() === 'granted';
  if (posthog) {
    posthog.set_config({ persistence: granted ? 'localStorage+cookie' : 'memory' });
    if (granted) posthog.startSessionRecording?.();
  }
  if (granted && META_PIXEL_ID && !window.fbq) loadMetaPixel(META_PIXEL_ID);
}

/** Meta Pixel – jen po souhlasu. Událost Lead má event_id kvůli deduplikaci s Conversions API. */
export function trackMetaLead(eventId: string) {
  window.fbq?.('track', 'Lead', {}, { eventID: eventId });
}

function loadMetaPixel(id: string) {
  /* eslint-disable */
  // Oficiální snippet Meta Pixelu (zkrácený).
  const f: any = window;
  if (f.fbq) return;
  const n: any = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  f.fbq('init', id);
  f.fbq('track', 'PageView');
}

async function loadPosthog() {
  if (!POSTHOG_KEY) return;
  const mod = await import('posthog-js');
  const ph = mod.default;
  const granted = $consent.get() === 'granted';
  ph.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: granted ? 'localStorage+cookie' : 'memory',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: !granted,
    person_profiles: 'identified_only',
  });
  posthog = ph;
  for (const [name, props] of queue.splice(0)) ph.capture(name, props);
}

export function identifyLead(email: string) {
  posthog?.identify?.(email.toLowerCase(), { email });
}

/** Automatické měření: page_view, sekce, hloubka scrollu, první interakce, viditelnost formulářů. */
export function initTracking() {
  if (typeof window === 'undefined' || window.__bbTrackInit) return;
  window.__bbTrackInit = true;
  window.dataLayer ||= [];

  track('page_view', { path: location.pathname, referrer: document.referrer || null });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        if (el.dataset.section) track('section_view', { section: el.dataset.section }, { once: true });
        if (el.dataset.formPlacement) track('form_view', { placement: el.dataset.formPlacement }, { once: true });
        if (el.dataset.section === 'hero') track('hero_view', {}, { once: true });
        io.unobserve(el);
      }
    },
    { threshold: 0.35 },
  );
  const observe = () => document.querySelectorAll<HTMLElement>('[data-section],[data-form-placement]').forEach((el) => io.observe(el));
  observe();
  setTimeout(observe, 1500); // formuláře v islands se vykreslí později

  const marks = [25, 50, 75, 100];
  const onScroll = () => {
    const h = document.documentElement;
    const depth = ((h.scrollTop + innerHeight) / h.scrollHeight) * 100;
    while (marks.length && depth >= marks[0] - 1) track('scroll_depth', { depth: marks.shift() });
    if (!marks.length) removeEventListener('scroll', onScroll);
  };
  addEventListener('scroll', onScroll, { passive: true });

  const first = (ev: Event) => {
    const t = ev.target as HTMLElement | null;
    track('first_interaction', { kind: ev.type, target: t?.closest('[data-track]')?.getAttribute('data-track') ?? t?.tagName?.toLowerCase() }, { once: true });
    removeEventListener('pointerdown', first, true);
    removeEventListener('keydown', first, true);
  };
  addEventListener('pointerdown', first, true);
  addEventListener('keydown', first, true);

  const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 3000 }) : setTimeout(cb, 1500));
  idle(() => {
    loadPosthog().then(applyConsent);
  });
}
