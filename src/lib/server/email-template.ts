// Transakční e-mail s tahákem. Personalizovaný podle ETF, která návštěvník řešil, a výsledku kalkulačky.
// Inline styly + tabulkový layout = spolehlivé zobrazení v Gmailu, Seznamu i Outlooku.
import { etfByTicker, etfs } from '../market';
import { czk, ter } from '../format';
import { PDF_URL, XLSX_URL } from '../config';

interface Input {
  email: string;
  tickers: string[];
  result: Record<string, unknown> | null;
  siteUrl: string;
  marketing: boolean;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function renderTahakEmail({ tickers, result, siteUrl, marketing }: Input) {
  const picked = (tickers.length ? tickers : ['VOO', 'SPY', 'SCHD']).map((t) => etfByTicker[t]).filter(Boolean).slice(0, 3);
  const pdf = new URL(PDF_URL, siteUrl).toString();
  const xlsx = new URL(XLSX_URL, siteUrl).toString();
  const first = picked[0]?.ticker ?? 'VOO';
  const subject = `Váš Startovací balíček ETF + dvojče k ${first}`;

  let resultHtml = '';
  let resultText = '';
  if (result?.kalkulacka === 'poplatky' && typeof result.ukousnuto === 'number') {
    resultHtml = `<p style="margin:0 0 16px">Váš výpočet: při ${czk(Number(result.mesicne))} měsíčně by vám fond s poplatkem kolem 2 % za ${result.let} let vzal oproti levnému ETF <strong>${czk(result.ukousnuto)}</strong>.</p>`;
    resultText = `Váš výpočet: fond s ~2% poplatkem by vám za ${result.let} let vzal ${czk(result.ukousnuto)}.`;
  } else if (result?.kalkulacka === 'stroj_casu' && typeof result.hodnota === 'number') {
    resultHtml = `<p style="margin:0 0 16px">Váš stroj času: ${czk(Number(result.mesicne))} měsíčně do ${esc(String(result.etf))} po dobu ${result.let} let = vloženo ${czk(Number(result.vlozeno))}, dnes <strong>${czk(result.hodnota)}</strong>. (Minulé výnosy nezaručují budoucí.)</p>`;
    resultText = `Stroj času: vloženo ${czk(Number(result.vlozeno))}, dnes ${czk(result.hodnota)}.`;
  }

  const rows = picked
    .map(
      (e) => `<tr>
  <td style="padding:12px 0;border-bottom:1px solid #e8e8e6;font:700 15px/1.3 Menlo,Consolas,monospace;color:#0a0a0a;vertical-align:top;width:64px">${e.ticker}</td>
  <td style="padding:12px 0;border-bottom:1px solid #e8e8e6;font:14px/1.45 Arial,sans-serif;color:#3f3f46">
    <strong style="color:#0a0a0a">${esc(e.twin.name)}</strong><br>
    ISIN <span style="font-family:Menlo,Consolas,monospace;color:#0b7a4c">${e.twin.isin}</span> · TER ${ter(e.twin.ter)}${e.twin.match === 'closest' ? ' · nejbližší alternativa' : ''}
  </td></tr>`,
    )
    .join('');

  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#f6f6f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f5"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e8e6;border-radius:20px">
<tr><td style="padding:28px 28px 8px;font:14px Arial,sans-serif;color:#71717a"><strong style="color:#0a0a0a">BestBrookies</strong> · Startovací balíček ETF 2026</td></tr>
<tr><td style="padding:8px 28px 0;font:600 26px/1.15 Arial,sans-serif;letter-spacing:-0.5px;color:#0a0a0a">Tady je váš balíček. A rovnou i dvojčata, která jste řešili.</td></tr>
<tr><td style="padding:16px 28px 0;font:15px/1.55 Arial,sans-serif;color:#3f3f46">
${resultHtml}
<p style="margin:0 0 8px">Americká ETF si u evropského brokera jako drobný investor nekoupíte. Tohle jsou jejich evropská dvojčata:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:16px 0 0">U brokera stačí do vyhledávání zadat <strong>ISIN</strong>. Zbylých ${etfs.length - picked.length} dvojčat, checklist před prvním nákupem a daně v ČR najdete v PDF. K tomu Excel šablona, kde si nastavíte vlastní plán:</p>
</td></tr>
<tr><td style="padding:20px 28px"><a href="${pdf}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;font:600 15px Arial,sans-serif;padding:14px 22px;border-radius:999px;margin:0 8px 8px 0">Checklist + překladač (PDF)</a><a href="${xlsx}" style="display:inline-block;background:#c9f24b;color:#0a0a0a;text-decoration:none;font:600 15px Arial,sans-serif;padding:14px 22px;border-radius:999px">Šablona plánu (Excel)</a></td></tr>
<tr><td style="padding:0 28px 24px;font:13px/1.5 Arial,sans-serif;color:#71717a">
${marketing ? 'Za dva dny vám pošleme návod, jak dvojče koupit u konkrétního brokera krok za krokem.' : 'Další e-maily vám posílat nebudeme. Pokud o ně stojíte, stačí odpovědět „chci“.'}
</td></tr>
<tr><td style="padding:16px 28px 28px;border-top:1px solid #e8e8e6;font:11.5px/1.5 Arial,sans-serif;color:#a1a1aa">
Informační obsah, ne investiční doporučení. Investice nesou riziko ztráty, minulá výkonnost nezaručuje budoucí výnosy. Před nákupem si přečtěte KID fondu.<br>
Tento e-mail jste dostali, protože jste si balíček vyžádali na ${esc(new URL(siteUrl).host)}. <a href="${new URL('/ochrana-udaju', siteUrl)}" style="color:#a1a1aa">Ochrana údajů</a>
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    subject,
    '',
    resultText,
    'Evropská dvojčata ETF, která jste řešili:',
    ...picked.map((e) => `${e.ticker} → ${e.twin.name}, ISIN ${e.twin.isin}, TER ${ter(e.twin.ter)}`),
    '',
    `Checklist + překladač (PDF): ${pdf}`,
    `Šablona plánu (Excel): ${xlsx}`,
    '',
    'Informační obsah, ne investiční doporučení.',
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  return { subject, html, text };
}
