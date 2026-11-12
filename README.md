# Portafolio · Pau Koh (Kl0ren)

Portafolio periodístico de Pau Andreu Koh Cuende — periodismo, comunidad y código. Live: **https://kloren.vercel.app** (ES) · **/en/** (EN).

## Estructura

| Carpeta | Qué hay |
|---|---|
| `web/` | Sitio en Astro (estático): home ES/EN, archivo de artículos (`/articles/`), 404, tests Playwright. Ver `web/README.md`. |
| `design/` | Diseño: plantillas HTML que se importaron a Figma, sprites pixel art y animaciones (`previews/`), favicon, portadas, i18n (`i18n/make_en.py`) y el exportador del sitio a Figma (`export/inline_site.py`). |

Figma: archivo `8UDpCGXOZvKFoH4cmIQUyH` (páginas Final, Assets & Sistema, Exploraciones, v2 · correcciones).

## Desarrollo

```bash
cd web
npm install
npm run dev        # desarrollo
npm run build      # build estático en web/dist
npm test           # Playwright
```

Deploy: `vercel deploy --prod` desde `web/`.

## Créditos

Ilustraciones y pixel art: Pau Koh. Portadas de notas: Tellus Cooperative. Logos de terceros (Stellar, Universidad Autónoma de Chile, stack vía Simple Icons) pertenecen a sus dueños.
