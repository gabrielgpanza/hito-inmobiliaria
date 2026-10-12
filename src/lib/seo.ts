import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import logo from '../assets/brand/logo-oscuro.png';
import { sitio, ubicacionSitio } from './sitio';
import { m2, parrafos, urlPropiedad, type Propiedad } from './propiedades';

// Datos estructurados (schema.org en JSON-LD): le cuentan a Google y a los asistentes de IA
// quién es Hito y qué tiene cada propiedad, sin que tengan que adivinarlo leyendo la página.

type Objeto = Record<string, unknown>;

const absoluta = (ruta: string, site: URL) => new URL(ruta, site).href;
const idInmobiliaria = (site: URL) => absoluta('/#inmobiliaria', site);

/** Referencia corta a la inmobiliaria (los datos completos están en la portada). */
const vendedor = (site: URL) => ({
  '@type': 'RealEstateAgent',
  '@id': idInmobiliaria(site),
  name: sitio.nombre,
  url: absoluta('/', site),
  telephone: `+${sitio.whatsapp}`,
});

/** Saca las claves vacías para no publicar datos en blanco. */
function limpio<T extends Objeto>(o: T): T {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

function direccion(localidad = ubicacionSitio.localidad, calle?: string) {
  return limpio({
    '@type': 'PostalAddress',
    streetAddress: calle,
    addressLocality: localidad,
    addressRegion: ubicacionSitio.provincia || undefined,
    addressCountry: 'AR',
  });
}

export function datosSitioWeb(site: URL): Objeto {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluta('/#sitio', site),
    url: absoluta('/', site),
    name: sitio.nombre,
    alternateName: 'Hito Inmobiliaria',
    inLanguage: 'es-AR',
    publisher: { '@id': idInmobiliaria(site) },
  };
}

export async function datosInmobiliaria(site: URL, foto?: ImageMetadata): Promise<Objeto> {
  const logoPng = await getImage({ src: logo, format: 'png', width: 600 });
  const imagen = foto ? await getImage({ src: foto, format: 'jpg', width: 1200 }) : undefined;
  return limpio({
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': idInmobiliaria(site),
    name: sitio.nombre,
    alternateName: 'Hito Inmobiliaria',
    url: absoluta('/', site),
    logo: absoluta(logoPng.src, site),
    image: absoluta(imagen?.src ?? '/og-hito.jpg', site),
    description: `Gestión de terrenos y construcción a medida en ${sitio.ciudad}. Representantes oficiales de Constructora Domus.`,
    slogan: sitio.hero_titulo,
    telephone: `+${sitio.whatsapp}`,
    email: sitio.email || undefined,
    address: direccion(ubicacionSitio.localidad, sitio.direccion),
    areaServed: sitio.ciudad,
    knowsAbout: ['Venta de terrenos', 'Loteos', 'Construcción de viviendas a medida', 'Constructora Domus'],
    sameAs: sitio.instagram ? [`https://www.instagram.com/${sitio.instagram}/`] : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'ventas',
      telephone: `+${sitio.whatsapp}`,
      availableLanguage: 'es',
      url: `https://wa.me/${sitio.whatsapp}`,
    },
  });
}

const tipoSchema: Record<string, string> = {
  Casa: 'SingleFamilyResidence',
  Dúplex: 'House',
  Departamento: 'Apartment',
};

const disponibilidad = {
  disponible: 'https://schema.org/InStock',
  reservado: 'https://schema.org/LimitedAvailability',
  vendido: 'https://schema.org/SoldOut',
} as const;

/** Ficha de una propiedad: el aviso (RealEstateListing) con su precio y el inmueble que ofrece. */
export function datosPropiedad(p: Propiedad, site: URL, imagenes: string[]): Objeto[] {
  const d = p.data;
  const url = absoluta(urlPropiedad(p), site);
  const tipo = tipoSchema[d.tipo] ?? 'Place';
  const esVivienda = tipo !== 'Place';
  const caracteristicas = [
    { name: 'Superficie total', value: m2(d.superficie_total) },
    { name: 'Superficie cubierta', value: m2(d.superficie_cubierta) },
    { name: 'Medidas', value: d.medidas },
    { name: 'Servicios', value: d.servicios.join(', ') },
    { name: 'Escritura', value: d.escritura },
    { name: 'Financiación', value: d.financiacion },
  ]
    .filter((x) => x.value)
    .map((x) => ({ '@type': 'PropertyValue', ...x }));

  const inmueble = limpio({
    '@type': tipo,
    name: d.titulo,
    address: direccion(d.localidad, d.ubicacion),
    hasMap: d.mapa,
    additionalProperty: caracteristicas,
    ...(esVivienda
      ? {
          floorSize: d.superficie_cubierta
            ? { '@type': 'QuantitativeValue', value: d.superficie_cubierta, unitCode: 'MTK' }
            : undefined,
          numberOfBedrooms: d.dormitorios,
          numberOfBathroomsTotal: d.banos,
        }
      : {}),
  });

  const aviso = limpio({
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${url}#aviso`,
    url,
    name: d.titulo,
    description: parrafos(d.descripcion).join(' ') || `${d.tipo} en ${d.operacion.toLowerCase()} en ${d.localidad}.`,
    image: imagenes,
    datePosted: d.fecha?.toISOString().slice(0, 10),
    inLanguage: 'es-AR',
    about: inmueble,
    offers: limpio({
      '@type': 'Offer',
      price: d.precio,
      priceCurrency: d.precio ? d.moneda : undefined,
      availability: disponibilidad[d.estado],
      businessFunction:
        d.operacion === 'Alquiler' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
      seller: vendedor(site),
      url,
    }),
    provider: vendedor(site),
  });

  const migas = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluta('/', site) },
      { '@type': 'ListItem', position: 2, name: 'Propiedades', item: absoluta('/propiedades/', site) },
      { '@type': 'ListItem', position: 3, name: d.titulo, item: url },
    ],
  };

  return [aviso, migas];
}
