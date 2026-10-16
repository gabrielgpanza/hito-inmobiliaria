import datos from '../data/enlaces.json';
import { sitio } from './sitio';
import { linkWhatsApp } from './propiedades';

// Página de enlaces (/enlaces/), la que abre el QR. Se edita desde el panel, en "Página del QR".
// El panel borra del JSON los campos que quedan vacíos, así que todos tienen un valor por defecto.

export const ICONOS = ['whatsapp', 'instagram', 'web', 'casa', 'construccion', 'salud'] as const;
export type Icono = (typeof ICONOS)[number];

export interface BotonEnlace {
  texto: string;
  href: string;
  icono?: Icono;
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
const esIcono = (v: unknown): v is Icono => ICONOS.includes(v as Icono);

/** Sin link, los botones de WhatsApp, Instagram y web usan los datos de "Datos del sitio". */
function linkPorIcono(icono: Icono | undefined): string {
  if (icono === 'whatsapp') return linkWhatsApp();
  if (icono === 'instagram' && sitio.instagram) return `https://www.instagram.com/${sitio.instagram}/`;
  if (icono === 'web') return '/';
  return '';
}

const botonesPorDefecto: BotonEnlace[] = [
  { texto: 'WhatsApp', href: linkWhatsApp(), icono: 'whatsapp', externo: true },
  { texto: 'Sitio Web', href: '/', icono: 'web', externo: false },
  { texto: 'Venta Propiedades', href: '/propiedades/', icono: 'casa', externo: false },
];

function armarBoton(b: unknown): BotonEnlace | undefined {
  if (!b || typeof b !== 'object') return undefined;
  const { texto: t, link, mensaje_whatsapp, icono: i } = b as Record<string, unknown>;
  const etiqueta = texto(t);
  if (!etiqueta) return undefined;
  const icono = esIcono(i) ? i : undefined;
  // Con mensaje de WhatsApp, el botón abre el chat con ese texto (y usa el número de "Datos del sitio").
  const mensaje = texto(mensaje_whatsapp);
  const href = mensaje ? linkWhatsApp(mensaje) : texto(link) || linkPorIcono(icono);
  if (!href) return undefined;
  return { texto: etiqueta, href, icono, externo: /^https?:\/\//i.test(href) };
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
