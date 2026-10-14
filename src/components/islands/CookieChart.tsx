// „Ukousnutá sušenka“: koláčový graf v podobě sušenky. Celá sušenka = co by vám zůstalo s levným ETF,
// ukousnutá výseč = podíl, který spolknou vyšší poplatky. Úhel výseče odpovídá podílu přesně.
import { useCountUp } from '../../lib/useCountUp';

interface Props {
  share: number; // 0..1
  size?: number;
  dark?: boolean;
}

const CHIPS = [
  [-0.38, -0.12, 0.075],
  [-0.1, 0.36, 0.06],
  [0.28, 0.22, 0.08],
  [-0.42, 0.3, 0.05],
  [0.05, -0.4, 0.055],
  [0.42, -0.05, 0.05],
  [-0.15, 0.05, 0.045],
];

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}

export default function CookieChart({ share, size = 220, dark = false }: Props) {
  const s = Math.max(0.005, Math.min(0.95, useCountUp(share, 1100)));
  const R = 100;
  const c = 110;
  const bite = s * Math.PI * 2;
  const body = dark ? '#f4f4f5' : '#0a0a0a';
  const chip = dark ? '#0a0a0a' : '#ffffff';
  const id = `ck${Math.round(size)}${dark ? 'd' : 'l'}`;
  // Popisek uprostřed ukousnuté výseče
  const mid = bite / 2;
  const lx = c + (R + 2) * 0.62 * Math.sin(mid);
  const ly = c - (R + 2) * 0.62 * Math.cos(mid);

  return (
    <svg viewBox="0 0 220 220" width={size} height={size} role="img" aria-label={`Poplatky spolknou ${Math.round(share * 100)} % konečné částky`}>
      <defs>
        <clipPath id={id}>
          <path d={arc(c, c, R + 1, bite, Math.PI * 2)} />
        </clipPath>
      </defs>
      {/* ukousnutá část – obrys */}
      <path d={arc(c, c, R, 0, bite)} fill={dark ? 'rgba(227,73,72,.16)' : 'var(--color-neg-soft)'} stroke="var(--color-neg)" stroke-width="1.5" stroke-dasharray="4 4" />
      {/* zbytek sušenky */}
      <g clip-path={`url(#${id})`}>
        <circle cx={c} cy={c} r={R} fill={body} />
        {CHIPS.map(([x, y, r]) => (
          <circle cx={c + x * R} cy={c + y * R} r={r * R} fill={chip} opacity={dark ? 0.9 : 0.95} />
        ))}
        <circle cx={c + 0.2 * R} cy={c - 0.18 * R} r={0.07 * R} fill="var(--color-lime)" />
      </g>
      <text x={lx} y={ly} text-anchor="middle" dominant-baseline="middle" font-size="17" font-weight="700" fill="var(--color-neg)" font-family="var(--font-sans)">
        −{Math.round(s * 100)} %
      </text>
    </svg>
  );
}
