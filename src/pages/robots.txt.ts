import type { APIRoute } from 'astro';

// Todo el sitio es público: buscadores y asistentes de IA pueden leerlo completo.
// A los asistentes los nombramos aparte para dejar claro que tienen permiso
// (así pueden recomendar las propiedades cuando alguien les pregunta).
const asistentesIA = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'DuckAssistBot',
  'meta-externalagent',
  'MistralAI-User',
];

export const GET: APIRoute = ({ site }) => {
  const url = (ruta: string) => new URL(ruta, site).href;
  const texto = [
    '# Hito Desarrollos Inmobiliarios',
    'User-agent: *',
    'Allow: /',
    '',
    '# Asistentes de IA: bienvenidos',
    ...asistentesIA.map((a) => `User-agent: ${a}`),
    'Allow: /',
    '',
    `Sitemap: ${url('/sitemap-index.xml')}`,
    '',
    `# Resumen del sitio y de las propiedades para asistentes de IA: ${url('/llms.txt')}`,
    '',
  ].join('\n');
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
