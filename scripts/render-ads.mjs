#!/usr/bin/env node
// Exportuje reklamní kreativy ze stránky /reklama do PNG (public/ads/*.png) a OG obrázek (public/og.png).
import { mkdir } from 'node:fs/promises';
import { launchBrowser, withPreview } from './render-pdf.mjs';

await mkdir('public/ads', { recursive: true });
await withPreview(async (base) => {
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1400, height: 2200 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/reklama`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const names = await page.$$eval('[data-ad]', (els) => els.map((e) => e.getAttribute('data-ad')));
  for (const name of names) {
    // Kreativa je v náhledu zmenšená a oříznutá – pro export ji naklonujeme do čistého kontejneru.
    await page.evaluate((n) => {
      document.getElementById('export')?.remove();
      const holder = document.createElement('div');
      holder.id = 'export';
      holder.style.cssText = 'position:absolute;left:0;top:0;z-index:9999';
      holder.appendChild(document.querySelector(`[data-ad="${n}"]`).cloneNode(true));
      document.body.appendChild(holder);
    }, name);
    const file = name === 'og' ? 'public/og.png' : `public/ads/${name}.png`;
    await page.locator('#export > [data-ad]').screenshot({ path: file });
    console.log('[ads]', file);
  }
  await browser.close();
});
