import datos from '../data/sitio.json';

// Datos generales del sitio (se editan desde el panel, en "Datos del sitio").
// El panel borra del JSON los campos que quedan vacíos, así que todos tienen un valor por defecto.
const porDefecto = {
  nombre: 'Hito Desarrollos Inmobiliarios',
  whatsapp: '5492302312807',
  whatsapp_visible: '',
  email: '',
  instagram: 'hitoinmobiliaria',
  direccion: 'Esquina San Martín y Eva Perón',
  ciudad: 'Huinca Renancó, Córdoba',
  horario: '',
  hero_volanta: 'Terrenos · Construcción a medida',
  hero_titulo: 'Marcamos el lugar donde empieza lo tuyo.',
  hero_texto:
    'Mirá los terrenos y propiedades disponibles, filtrá por localidad y escribinos por WhatsApp con lo que te interesa.',
  hero_imagen: '',
  nosotros_titulo: 'Quiénes somos',
  nosotros_texto: '',
  nosotros_firma: '',
  construccion_encabezado: 'De la vidriera a tu terreno, contactanos.',
  construccion_titulo: 'Del terreno a la casa, con el mismo equipo.',
  construccion_texto: 'Gestionamos tu terreno y la construcción de tu casa.',
  construccion_imagen: '',
};

type Sitio = typeof porDefecto;

const cargados = datos as Partial<Record<keyof Sitio, unknown>>;
const texto = (v: unknown, def: string) => (typeof v === 'string' && v.trim() ? v.trim() : def);

export const sitio: Sitio = Object.fromEntries(
  Object.entries(porDefecto).map(([clave, def]) => [clave, texto(cargados[clave as keyof Sitio], def)]),
) as Sitio;

// WhatsApp: solo dígitos (por si lo cargan con espacios, guiones o el "+").
sitio.whatsapp = sitio.whatsapp.replace(/\D/g, '') || porDefecto.whatsapp;
sitio.instagram = sitio.instagram.replace(/^@/, '');

/** "Huinca Renancó, Córdoba" → { localidad: "Huinca Renancó", provincia: "Córdoba" } */
export const ubicacionSitio = (() => {
  const [localidad, ...resto] = sitio.ciudad.split(',').map((s) => s.trim());
  return { localidad, provincia: resto.join(', ') };
})();
