// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dirección pública del sitio. En Cloudflare se define la variable SITE_URL
// (ej: https://hito.com.ar). Si no está, se usa la URL de la vista previa de Cloudflare.
const site = process.env.SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [sitemap()],
});
