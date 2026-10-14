// Hero varianta B („poplatky“): volba měsíční částky → sušenka + částka, kterou ukousnou poplatky.
import { useState } from 'preact/hooks';
import { feeComparison } from '../../lib/finance';
import { czk, czkShort, pct, ter } from '../../lib/format';
import { openLead } from '../../lib/store';
import { track } from '../../lib/track';
import { useCountUp } from '../../lib/useCountUp';
import CookieChart from './CookieChart';

interface Props {
  cheapFee: number;
  fundFee: number;
  gross: number;
  years: number;
}

const AMOUNTS = [1000, 3000, 5000, 10000];

export default function FeeHero({ cheapFee, fundFee, gross, years }: Props) {
  const [amount, setAmount] = useState(3000);
  const r = feeComparison(amount, years, gross, cheapFee, fundFee);
  const lost = useCountUp(r.lost);

  return (
    <div class="relative">
      <div class="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(227,73,72,0.12),transparent)] blur-2xl" />
      <p class="mb-2 text-center text-[13px] text-[var(--color-muted)]">Kolik měsíčně investujete (Kč)?</p>
      <div class="flex justify-center">
        <div class="seg" role="group" aria-label="Kolik měsíčně investujete">
          {AMOUNTS.map((a) => (
            <button
              type="button"
              aria-pressed={a === amount}
              class="num"
              onClick={() => {
                setAmount(a);
                track('hero_chip_click', { amount: a });
              }}
            >
              {a.toLocaleString('cs-CZ')}
            </button>
          ))}
        </div>
      </div>
      <div class="mt-6 flex flex-col items-center">
        <div class="float">
          <CookieChart share={r.lost / r.cheap} size={210} />
        </div>
        <p class="mt-4 text-[14px] text-[var(--color-muted)]">Fond s poplatkem {pct(fundFee, 2)} vám za {years} let ukousne</p>
        <p class="num mt-1 text-[2.6rem] leading-none font-semibold tracking-[-0.04em] text-[var(--color-neg)]">{czk(lost)}</p>
        <p class="mt-2 text-[13.5px] text-[var(--color-muted)]">
          z {czkShort(r.cheap)}, které by vám nechalo ETF s poplatkem {ter(cheapFee)}
        </p>
        <button
          type="button"
          class="mt-3 text-[13px] text-[var(--color-ink-2)] underline decoration-[var(--color-line)] underline-offset-4 hover:decoration-[var(--color-ink)]"
          onClick={() => {
            track('lock_click', { where: 'hero_fees', amount });
            openLead({ source: 'hero_fees', result: { kalkulacka: 'poplatky', mesicne: amount, let: years, ukousnuto: Math.round(r.lost) }, headline: `Jak ušetřit ${czkShort(r.lost)}: levná dvojčata a šablona plánu` });
          }}
        >
          Předpoklad {pct(gross, 0)} ročně před poplatky · jak to snížit →
        </button>
      </div>
    </div>
  );
}
