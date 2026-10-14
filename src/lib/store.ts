// Sdílený stav mezi ostrůvky (islands).
import { atom } from 'nanostores';

const LS_KEY = 'bb_unlocked';

function readUnlocked() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Návštěvník už zadal e-mail → dvojčata jsou odemčená. */
export const $unlocked = atom<boolean>(readUnlocked());
$unlocked.listen((v) => {
  try {
    localStorage.setItem(LS_KEY, v ? '1' : '0');
  } catch {}
});

export interface LeadContext {
  /** Odkud byl formulář otevřen (lock_compare, calc_fees, hero, sticky…) */
  source: string;
  /** Nadpis v bottom sheetu */
  headline?: string;
  /** ETF, která návštěvník řešil */
  tickers?: string[];
  /** Shrnutí výsledku kalkulačky do e-mailu */
  result?: Record<string, string | number>;
}

/** Otevřený bottom sheet s formulářem (null = zavřeno). */
export const $sheet = atom<LeadContext | null>(null);

/** Poslední kontext interakce – přiloží se k leadu i při odeslání z jiného formuláře. */
export const $context = atom<LeadContext>({ source: 'page' });

export function openLead(ctx: LeadContext) {
  $context.set({ ...$context.get(), ...ctx });
  $sheet.set(ctx);
}
