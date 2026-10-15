// Nadpis kreativ = nadpis hero (message match). Počítá se ze stejných předpokladů jako web.
import { futureValue } from '../../lib/finance';
import { dec, fmtInt } from '../../lib/format';
import { cheapTwinTer } from '../../lib/market';
import { GROSS_RETURN, GROWTH_MONTHLY, GROWTH_YEARS } from '../../lib/config';

const v = futureValue(GROWTH_MONTHLY, GROWTH_YEARS, GROSS_RETURN, cheapTwinTer);
export const millions = `${dec(Math.floor(v / 1e5) / 10, 1)} milionu`;
export const monthlyLabel = `${fmtInt(GROWTH_MONTHLY)} Kč`;
export const disclaimer = `Při výnosu ${Math.round(GROSS_RETURN * 100)} % ročně za ${GROWTH_YEARS} let. Výnos není zaručený, hodnota může i klesat.`;
