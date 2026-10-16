import datos from '../data/enlaces.json';
import { sitio } from './sitio';
import { linkWhatsApp } from './propiedades';

// Página de enlaces (/enlaces/), la que abre el QR. Se edita desde el panel, en "Página del QR".
// El panel borra del JSON los campos que quedan vacíos, así que todos tienen un valor por defecto.

export interface BotonEnlace {
  texto: string;
  href: string;
  /** Links a otros sitios (y WhatsApp) se abren en una pestaña nueva. */
  externo: boolean;
}

const porDefecto = {
  titulo: sitio.nombre,
  subtitulo: sitio.ciudad,
  imagen: sitio.hero_imagen,
  firma: sitio.nosotros_firma,
};

type Cargados = Partial<Record<keyof typeof porDefecto | 'botones', unknown>>;
const cargados = datos as Cargados;
const texto = (v: unknown, def = '') => (typeof v === 'string' && v.trim() ? v.trim() : def);

const botonesPorDefecto: BotonEnlace[] = [
  { texto: 'Venta Propiedades', href: '/propiedades/', externo: false },
  { texto: 'Construcción', href: '/#construccion', externo: false },
];

function armarBoton(b: unknown): BotonEnlace | undefined {
  if (!b || typeof b !== 'object') return undefined;
  const { texto: t, link, mensaje_whatsapp } = b as Record<string, unknown>;
  const etiqueta = texto(t);
  if (!etiqueta) return undefined;
  // Con mensaje de WhatsApp, el botón abre el chat con ese texto (y usa el número de "Datos del sitio").
  const mensaje = texto(mensaje_whatsapp);
  if (mensaje) return { texto: etiqueta, href: linkWhatsApp(mensaje), externo: true };
  const href = texto(link);
  if (!href) return undefined;
  return { texto: etiqueta, href, externo: /^https?:\/\//i.test(href) };
}

const botones = Array.isArray(cargados.botones)
  ? cargados.botones.map(armarBoton).filter((b): b is BotonEnlace => Boolean(b))
  : [];

export const enlaces = {
  titulo: texto(cargados.titulo, porDefecto.titulo),
  subtitulo: texto(cargados.subtitulo, porDefecto.subtitulo),
  imagen: texto(cargados.imagen, porDefecto.imagen),
  firma: texto(cargados.firma, porDefecto.firma),
  botones: botones.length ? botones : botonesPorDefecto,
};
