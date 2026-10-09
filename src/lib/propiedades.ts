import { getCollection, type CollectionEntry } from 'astro:content';
import sitio from '../data/sitio.json';

export type Propiedad = CollectionEntry<'propiedades'>;

/** Todas las propiedades: primero las disponibles, después reservadas y vendidas; dentro de cada grupo, las más nuevas primero. */
export async function todasLasPropiedades(): Promise<Propiedad[]> {
  const peso = { disponible: 0, reservado: 1, vendido: 2 } as const;
  const lista = await getCollection('propiedades');
  return lista.sort((a, b) => {
    const porEstado = peso[a.data.estado] - peso[b.data.estado];
    if (porEstado !== 0) return porEstado;
    return (b.data.fecha?.getTime() ?? 0) - (a.data.fecha?.getTime() ?? 0);
  });
}

export function urlPropiedad(p: Propiedad): string {
  return `/propiedades/${p.id}/`;
}

const miles = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

export function formatoPrecio(p: Propiedad): string {
  if (p.data.estado === 'vendido') return 'Vendido';
  if (!p.data.precio) return 'Consultar';
  const signo = p.data.moneda === 'USD' ? 'USD' : '$';
  return `${signo} ${miles.format(p.data.precio)}`;
}

export function m2(n: number | undefined): string | undefined {
  return n ? `${miles.format(n)} m²` : undefined;
}

/** Resumen corto para tarjetas: "3 dorm. · 2 baños · 220 m² cub." o "600 m²". */
export function resumen(p: Propiedad): string {
  const d = p.data;
  const partes: string[] = [];
  if (d.dormitorios) partes.push(`${d.dormitorios} dorm.`);
  if (d.banos) partes.push(`${d.banos} ${d.banos === 1 ? 'baño' : 'baños'}`);
  if (d.superficie_cubierta) partes.push(`${miles.format(d.superficie_cubierta)} m² cub.`);
  else if (d.superficie_total) partes.push(`${miles.format(d.superficie_total)} m²`);
  return partes.join(' · ');
}

export const etiquetaEstado = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
} as const;

export function linkWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${sitio.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/** Saca el ID de un link de YouTube (watch, youtu.be, shorts o embed). */
export function idYouTube(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m?.[1];
}

/** Separa la descripción en párrafos (una línea en blanco = párrafo nuevo). */
export function parrafos(texto: string | undefined): string[] {
  if (!texto) return [];
  return texto
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Número estable a partir de un texto, para variar la ilustración cuando no hay foto. */
export function semilla(texto: string): number {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
