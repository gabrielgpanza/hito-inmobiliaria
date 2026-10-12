import type { APIRoute } from 'astro';
import { etiquetaEstado, formatoPrecio, linkWhatsApp, m2, parrafos, todasLasPropiedades, urlPropiedad } from '../lib/propiedades';
import { sitio } from '../lib/sitio';

// llms.txt (https://llmstxt.org): un resumen en texto plano para asistentes de IA
// (ChatGPT, Claude, Perplexity…). Se arma solo con cada publicación, con las propiedades al día.

export const GET: APIRoute = async ({ site }) => {
  const url = (ruta: string) => new URL(ruta, site).href;
  const propiedades = await todasLasPropiedades();
  const activas = propiedades.filter((p) => p.data.estado !== 'vendido');
  const vendidas = propiedades.filter((p) => p.data.estado === 'vendido');

  const ficha = (p: (typeof propiedades)[number]) => {
    const d = p.data;
    const datos = [
      `${d.operacion} · ${d.tipo} · ${[d.ubicacion, d.localidad].filter(Boolean).join(', ')}`,
      `Estado: ${etiquetaEstado[d.estado]}`,
      `Precio: ${formatoPrecio(p)}${d.financiacion && d.estado !== 'vendido' ? ` (financiación: ${d.financiacion})` : ''}`,
      m2(d.superficie_total) && `Superficie total: ${m2(d.superficie_total)}`,
      m2(d.superficie_cubierta) && `Superficie cubierta: ${m2(d.superficie_cubierta)}`,
      d.medidas && `Medidas: ${d.medidas}`,
      d.dormitorios && `Dormitorios: ${d.dormitorios}`,
      d.banos && `Baños: ${d.banos}`,
      d.servicios.length > 0 && `Servicios: ${d.servicios.join(', ')}`,
      d.escritura && `Escritura: ${d.escritura}`,
      d.mapa && `Mapa: ${d.mapa}`,
      parrafos(d.descripcion).join(' '),
    ].filter(Boolean);
    return `### [${d.titulo}](${url(urlPropiedad(p))})\n\n${datos.map((x) => `- ${x}`).join('\n')}`;
  };

  const texto = [
    `# ${sitio.nombre}`,
    '',
    `> Inmobiliaria de ${sitio.ciudad} (Argentina): gestión de terrenos, loteos y construcción de viviendas a medida. Representantes oficiales de Constructora Domus. Las consultas se hacen por WhatsApp.`,
    '',
    parrafos(sitio.nosotros_texto).join(' '),
    '',
    '## Contacto',
    '',
    ...[
      `- WhatsApp: +${sitio.whatsapp} (${linkWhatsApp()})`,
      `- Dirección: ${sitio.direccion}, ${sitio.ciudad}`,
      sitio.horario && `- Horario: ${sitio.horario}`,
      sitio.instagram && `- Instagram: https://www.instagram.com/${sitio.instagram}/`,
      sitio.email && `- Email: ${sitio.email}`,
    ].filter(Boolean),
    '',
    '## Páginas',
    '',
    `- [Inicio](${url('/')}): quiénes somos, propiedades destacadas, construcción a medida y localidades.`,
    `- [Propiedades](${url('/propiedades/')}): catálogo completo con filtros por localidad, tipo y precio (ej: ${url('/propiedades/?tipo=Lote')}).`,
    '',
    `## Propiedades disponibles (${activas.length})`,
    '',
    activas.length ? activas.map(ficha).join('\n\n') : 'Por el momento no hay propiedades publicadas.',
    '',
    ...(vendidas.length
      ? ['## Optional', '', 'Propiedades ya vendidas (se muestran como referencia):', '', vendidas.map(ficha).join('\n\n'), '']
      : []),
  ].join('\n');

  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
