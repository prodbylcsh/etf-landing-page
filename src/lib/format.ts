// Formátování čísel pro češtinu (mezera jako oddělovač tisíců, desetinná čárka).
const nbsp = ' ';

const intFmt = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 });

export const fmtInt = (n: number) => intFmt.format(Math.round(n)).replace(/\s/g, nbsp);

export const czk = (n: number) => `${fmtInt(n)}${nbsp}Kč`;

/** 4,1 mil. Kč / 1,2 mld. Kč */
export function czkShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${dec(n / 1e9, 1)}${nbsp}mld.${nbsp}Kč`;
  if (abs >= 1e6) return `${dec(n / 1e6, abs >= 1e7 ? 1 : 2)}${nbsp}mil.${nbsp}Kč`;
  return czk(n);
}

export function usdShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${dec(n / 1e12, 2)}${nbsp}bil.${nbsp}USD`;
  if (abs >= 1e9) return `${dec(n / 1e9, abs >= 1e11 ? 0 : 1)}${nbsp}mld.${nbsp}USD`;
  if (abs >= 1e6) return `${dec(n / 1e6, 0)}${nbsp}mil.${nbsp}USD`;
  return `${fmtInt(n)}${nbsp}USD`;
}

export function dec(n: number, digits = 1): string {
  return new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    .format(n)
    .replace(/\s/g, nbsp);
}

/** 0.0007 → "0,07 %" */
export function pct(n: number | null | undefined, digits = 2, signed = false): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const v = n * 100;
  const s = new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(v);
  return `${s.replace('-', '−')}${nbsp}%`;
}

/** TER bez zbytečných nul: 0.0003 → "0,03 %", 0.000945 → "0,0945 %" */
export function ter(n: number | null | undefined): string {
  if (n == null) return '—';
  const v = Math.round(n * 1e6) / 1e4; // procenta na 4 desetinná místa
  const s = new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v);
  return `${s}${nbsp}%`;
}

const months = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

/** "2026-10-13" → "13. 10. 2026" */
export function dateCz(iso: string | null | undefined, long = false): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (long) return `${d}.${nbsp}${months[m - 1]} ${y}`;
  return d ? `${d}.${nbsp}${m}.${nbsp}${y}` : `${m}/${y}`;
}

export const ymCz = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return `${m}/${y}`;
};

/** Sklonování: plural(3, ['rok','roky','let']) */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}
