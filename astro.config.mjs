// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// PostHog project key je veřejný (phc_…). Přijímáme i názvy, které vytváří integrace PostHog ↔ Vercel.
const env = process.env;
const posthogKey = env.PUBLIC_POSTHOG_KEY || env.NEXT_PUBLIC_POSTHOG_KEY || env.POSTHOG_KEY || env.POSTHOG_API_KEY || env.POSTHOG_PROJECT_API_KEY || '';
const posthogHost = env.PUBLIC_POSTHOG_HOST || env.NEXT_PUBLIC_POSTHOG_HOST || env.POSTHOG_HOST || 'https://eu.i.posthog.com';

export default defineConfig({
  site: env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://bestbrookies.vercel.app'),
  output: 'static',
  adapter: vercel(),
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.PUBLIC_POSTHOG_KEY': JSON.stringify(posthogKey),
      'import.meta.env.PUBLIC_POSTHOG_HOST': JSON.stringify(posthogHost),
    },
  },
  build: { inlineStylesheets: 'always' },
});
