// SVG ikony a vlajky – používají je Astro komponenty i Preact ostrůvky.
type P = { class?: string; size?: number };

export const FlagUS = ({ class: c = '', size = 20 }: P) => (
  <svg viewBox="0 0 30 20" width={size * 1.5} height={size} class={c} aria-label="USA" role="img">
    <rect width="30" height="20" rx="3" fill="#fff" />
    {[0, 2, 4, 6, 8, 10, 12].map((i) => (
      <rect y={(i * 20) / 13} width="30" height={20 / 13} fill="#d93a3a" />
    ))}
    <rect width="13" height={(20 / 13) * 7} rx="0" fill="#2a4fa3" />
    <rect width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,.08)" />
  </svg>
);

export const FlagEU = ({ class: c = '', size = 20 }: P) => (
  <svg viewBox="0 0 30 20" width={size * 1.5} height={size} class={c} aria-label="EU" role="img">
    <rect width="30" height="20" rx="3" fill="#1f45b8" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle cx={15 + Math.cos(a) * 6} cy={10 + Math.sin(a) * 6} r="0.95" fill="#ffd43b" />;
    })}
  </svg>
);

const base = (c: string, size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' as const, 'stroke-linejoin': 'round' as const, class: c, 'aria-hidden': true });

export const IconCheck = ({ class: c = '', size = 18 }: P) => (
  <svg {...base(c, size)}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const IconX = ({ class: c = '', size = 18 }: P) => (
  <svg {...base(c, size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconLock = ({ class: c = '', size = 18 }: P) => (
  <svg {...base(c, size)}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
  </svg>
);
export const IconArrow = ({ class: c = '', size = 18 }: P) => (
  <svg {...base(c, size)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconDoc = ({ class: c = '', size = 24 }: P) => (
  <svg {...base(c, size)}>
    <path d="M7 3h7l4 4v14H7z" />
    <path d="M14 3v4h4M10 12h5M10 15.5h5" />
  </svg>
);
export const IconBank = ({ class: c = '', size = 24 }: P) => (
  <svg {...base(c, size)}>
    <path d="M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </svg>
);
export const IconShield = ({ class: c = '', size = 24 }: P) => (
  <svg {...base(c, size)}>
    <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
  </svg>
);
export const IconSpark = ({ class: c = '', size = 24 }: P) => (
  <svg {...base(c, size)}>
    <path d="M4 17l5-5 4 3 7-8" />
    <path d="M15 7h5v5" />
  </svg>
);
export const IconChecklist = ({ class: c = '', size = 24 }: P) => (
  <svg {...base(c, size)}>
    <path d="M4 6.5l1.5 1.5L8 5.5M4 12.5L5.5 14 8 11.5M4 18.5L5.5 20 8 17.5M11 7h9M11 13h9M11 19h9" />
  </svg>
);
export const IconSheet = ({ class: c = '', size = 24 }: P) => (
  <svg {...base(c, size)}>
    <rect x="4" y="4" width="16" height="16" rx="2.5" />
    <path d="M4 9.5h16M4 15h16M10 4v16" />
  </svg>
);
export const IconSwap = ({ class: c = '', size = 24 }: P) => (
  <svg {...base(c, size)}>
    <path d="M4 8h13l-3-3M20 16H7l3 3" />
  </svg>
);
