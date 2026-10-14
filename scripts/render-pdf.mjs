#!/usr/bin/env node
// Vyrenderuje stránku /tahak (A4 tisková šablona) do PDF v public/.
// Potřebuje hotový build (npm run build). Servíruje dist/, otevře stránku v Chromiu a uloží PDF.
import http from 'node:http';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { chromium } from 'playwright-core';

export const PDF_NAME = 'bestbrookies-etf-checklist-2026.pdf';
const PORT = 4329;

export function launchBrowser() {
  const local = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  if (process.env.CHROME_PATH) return chromium.launch({ executablePath: process.env.CHROME_PATH });
  if (process.env.CHROME_CHANNEL) return chromium.launch({ channel: process.env.CHROME_CHANNEL });
  if (existsSync(local)) return chromium.launch({ executablePath: local });
  return chromium.launch({ channel: 'chrome' });
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.pdf': 'application/pdf' };

/** Spustí jednoduchý statický server nad dist/ (Vercel adapter nepodporuje `astro preview`). */
export async function withPreview(fn) {
  const root = existsSync('dist/client') ? path.resolve('dist/client') : path.resolve('dist');
  if (!existsSync(root)) throw new Error('Chybí dist/ – nejdřív spusťte npm run build');
  const server = http.createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, p);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    } catch {
      if (existsSync(file + '.html')) file += '.html';
      else if (existsSync(path.join(file, 'index.html'))) file = path.join(file, 'index.html');
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end('404');
    }
  });
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  try {
    return await fn(`http://127.0.0.1:${PORT}`);
  } finally {
    server.close();
  }
}

async function main() {
  await withPreview(async (base) => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(`${base}/tahak`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: `public/${PDF_NAME}`,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
    await browser.close();
    console.log(`[pdf] Uloženo public/${PDF_NAME}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
