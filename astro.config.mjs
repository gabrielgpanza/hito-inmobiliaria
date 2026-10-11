// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dirección pública del sitio: se usa en la dirección canónica, el mapa del sitio, robots.txt,
// llms.txt y las vistas previas al compartir. Se puede pisar con la variable SITE_URL en Cloudflare.
const site = process.env.SITE_URL || 'https://hitoinmobiliaria.com';

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [sitemap()],
});
