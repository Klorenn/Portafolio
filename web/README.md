# KL0REN — portafolio periodístico (Pau Koh)

Astro 6, salida estática, sin framework de cliente (solo `<script>` vanilla). Rutas: `/` (ES), `/en/` (EN), `404`.

## Comandos
```bash
npm install
npm run dev       # desarrollo
npm run build     # genera dist/
npm run preview   # sirve dist/
npm test          # Playwright (construye y levanta preview solo). 1ra vez: npx playwright install chromium
```

## Editar contenido
- Textos: `src/i18n/es.ts` y `src/i18n/en.ts` (mismo tipo `Copy` en `src/i18n/types.ts`).
- Datos no traducibles (imágenes, URLs, cintas VHS): `src/data/site.ts`.
- **URLs de cada nota del blog**: `WORKS[].url` en `src/data/site.ts` (hoy `null` con `TODO`; mientras tanto el botón enlaza al perfil de autor).
- Estilos: una sola hoja, `src/styles/global.css` (tokens en `:root`).
- Imágenes: `public/img/`.

## Cambiar la URL del sitio (`site`)
`astro.config.mjs` -> `site` (placeholder `https://kloren.vercel.app`). Se usa en canonical, og:image y twitter:image. También sirve la variable `SITE_URL` al construir.

## Deploy
- **Vercel**: importar el repo (Astro se detecta), build `npm run build`, salida `dist`. Definir `SITE_URL`.
- **GitHub Pages** (sub-ruta): `SITE_URL=https://USUARIO.github.io BASE_PATH=/REPO npm run build` y publicar `dist/`. Enlaces y assets respetan `BASE_PATH`.

Nota: Astro 7 exige Node >= 22.23.4; este proyecto usa Astro 6 (Node >= 22.12).
