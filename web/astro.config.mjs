// @ts-check
import { defineConfig } from 'astro/config';

// IMPORTANT: replace `site` with your real production URL (used for og:image / canonical).
// For GitHub Pages under a sub-path, build with BASE_PATH=/repo-name (see README).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://kloren.vercel.app',
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  // old Spanish archive route → English route
  redirects: { '/articulos': '/articles/' },
});
