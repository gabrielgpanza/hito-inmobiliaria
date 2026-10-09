import type { ImageMetadata } from 'astro';

// Todas las fotos subidas desde el panel viven en src/assets/uploads.
// Las buscamos por nombre de archivo, así no importa con qué ruta las guarde el panel.
const archivos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

const porNombre = new Map<string, ImageMetadata>();
for (const [ruta, mod] of Object.entries(archivos)) {
  porNombre.set(ruta.split('/').pop()!.toLowerCase(), mod.default);
}

export function buscarImagen(ruta: string | undefined): ImageMetadata | undefined {
  if (!ruta) return undefined;
  const nombre = decodeURIComponent(ruta.split('?')[0].split('/').pop() ?? '').toLowerCase();
  return porNombre.get(nombre);
}

export function fotosDe(rutas: string[]): ImageMetadata[] {
  return rutas.map(buscarImagen).filter((x): x is ImageMetadata => Boolean(x));
}
