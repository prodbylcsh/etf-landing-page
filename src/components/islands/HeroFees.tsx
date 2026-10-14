// Hero varianta B („poplatky“): volba měsíční částky → okamžitě „kolik vám ukousnou poplatky za 25 let“.
import { useState } from 'preact/hooks';
import { feeComparison } from '../../lib/finance';
import { czk, czkShort, pct, ter } from '../../lib/format';
import { openLead } from '../../lib/store';
import { track } from '../../lib/track';

interface Props {
  cheapFee: number;
  fundFee: number;
  gross: number;
  years: number;
}

const AMOUNTS = [1000, 3000, 5000, 10000];

export default function HeroFees({ cheapFee, fundFee, gross, years }: Props) {
  const [amount, setAmount] = useState(3000);
  const r = feeComparison(amount, years, gross, cheapFee, fundFee);
  const max = r.cheap;

  return (
    <div class="rounded-2xl bg-[var(--color-card)] p-3.5 ring-1 ring-[var(--color-rule)]">
      <p class="kicker">Kolik měsíčně investujete?</p>
      <div class="mt-2 grid grid-cols-4 gap-1.5" role="group" aria-label="Měsíční částka">
        {AMOUNTS.map((a) => (
          <button
            type="button"
            class="chip justify-center !px-1 text-[0.82rem]"
            aria-pressed={a === amount}
            data-track="hero_amount"
            onClick={() => {
              setAmount(a);
              track('hero_chip_click', { amount: a });
            }}
          >
            {a.toLocaleString('cs-CZ')}
          </button>
        ))}
      </div>

      <div class="terminal mt-3 p-3.5">
        <p class="text-[13px] text-[#b9c7c0]">Za {years} let vám fond s poplatkem {pct(fundFee, 1)} ukousne oproti ETF</p>
        <p key={amount} class="num animate-rise mt-1 text-[2.1rem] leading-none font-bold text-[var(--color-amber)]">{czk(r.lost)}</p>
        <div class="mt-3 space-y-2 text-[12.5px]">
          <Bar label={`ETF (${ter(cheapFee)})`} value={r.cheap} max={max} color="var(--color-phosphor)" />
          <Bar label={`Fond (${pct(fundFee, 2)})`} value={r.expensive} max={max} color="#c68a00" />
        </div>
      </div>
      <button
        type="button"
        class="mt-2.5 text-left text-[13px] leading-snug text-[var(--color-muted)] underline decoration-dotted underline-offset-2"
        onClick={() => {
          track('lock_click', { where: 'hero_fees', amount });
          openLead({ source: 'hero_fees', result: { amount, years, lost: Math.round(r.lost) }, headline: `Jak ušetřit ${czkShort(r.lost)}: levná dvojčata 12 ETF v jednom PDF` });
        }}
      >
        Vklad {czk(amount)} měsíčně, předpoklad výnosu {pct(gross, 0)} ročně před poplatky. Jak to spočítat přesně →
      </button>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div class="flex justify-between text-[#c9d4ce]">
        <span>{label}</span>
        <span class="num text-white">{czkShort(value)}</span>
      </div>
      <div class="mt-1 h-2 rounded-full bg-[var(--color-term-line)]">
        <div class="h-2 rounded-full transition-[width] duration-500" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}
