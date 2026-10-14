// Výpočty pro kalkulačky. Vše měsíčně, vklad na začátku měsíce.

/** Budoucí hodnota pravidelné měsíční investice při ročním výnosu `gross` a ročním poplatku `fee`. */
export function futureValue(monthly: number, years: number, gross: number, fee: number): number {
  const r = Math.pow(1 + gross - fee, 1 / 12) - 1;
  const n = Math.round(years * 12);
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

export interface FeeResult {
  invested: number;
  cheap: number;
  expensive: number;
  lost: number;
  feesPaidCheap: number;
}

export function feeComparison(monthly: number, years: number, gross: number, cheapFee: number, expensiveFee: number): FeeResult {
  const invested = monthly * years * 12;
  const noFee = futureValue(monthly, years, gross, 0);
  const cheap = futureValue(monthly, years, gross, cheapFee);
  const expensive = futureValue(monthly, years, gross, expensiveFee);
  return { invested, cheap, expensive, lost: cheap - expensive, feesPaidCheap: noFee - cheap };
}

export type Series = [string, number][]; // [YYYY-MM, adjusted close USD]

export interface TimeMachinePoint {
  ym: string;
  invested: number;
  value: number;
}

/**
 * Pravidelná investice `monthlyCzk` od měsíce `startYm` do posledního dostupného měsíce.
 * Každý měsíc se koruny převedou kurzem ČNB na USD a nakoupí se podíl za adjusted close
 * (adjusted close zahrnuje reinvestované dividendy). Hodnota se převádí zpět aktuálním kurzem.
 */
export function timeMachine(series: Series, fx: Record<string, number>, monthlyCzk: number, startYm: string, currentFx: number): TimeMachinePoint[] {
  let units = 0;
  let invested = 0;
  const out: TimeMachinePoint[] = [];
  for (const [ym, price] of series) {
    if (ym < startYm) continue;
    const rate = fx[ym] ?? currentFx;
    units += monthlyCzk / rate / price;
    invested += monthlyCzk;
    out.push({ ym, invested, value: units * price * rate });
  }
  if (out.length) {
    const last = out[out.length - 1];
    const lastPrice = series[series.length - 1][1];
    last.value = units * lastPrice * currentFx;
  }
  return out;
}
