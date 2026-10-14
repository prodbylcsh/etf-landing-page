// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL || 'https://bestbrookies.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [preact()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'always' },
});
