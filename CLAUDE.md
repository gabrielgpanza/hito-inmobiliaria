# Hito Inmobiliaria — contexto del proyecto

Hablá en español rioplatense (vos), claro y sin tecnicismos: quien pide los cambios no es programador.

## Qué es

Web vidriera de **Hito Desarrollos Inmobiliarios** (Huinca Renancó, Córdoba; Esquina San Martín y Eva Perón; Instagram @hitoinmobiliaria; representantes oficiales de Constructora Domus; rubro: gestión de terrenos y construcción a medida). Detrás está **Organización PG – Panza Girardi**, empresa familiar con más de 40 años en la zona (consultora impositivo-contable, seguros y Sancor Salud). La gente mira propiedades, filtra y consulta por WhatsApp (no hay formularios ni base de datos). Referencia de estilo funcional: raicesaltagracia.com.ar.

- **Dominio oficial: https://hitoinmobiliaria.com** (está fijo en `astro.config.mjs`; la variable `SITE_URL` de Cloudflare lo puede pisar).
- Repo: `gabrielgpanza/hito-inmobiliaria` (antes estaba en `matiascavallo/hito-inmobiliaria`, ya no se usa).
- Diseño original (canvas de Claude): [Hito — Propuesta web](https://claude.ai/artifact/WyHE8Sx98qSPAD3uN4Cz3U).

## Stack y decisiones

- Astro 7 estático (sin servidor), Node ≥ 22.12. Sin frameworks de UI: JS vanilla en `<script>` de Astro.
- Hosting: Cloudflare Pages (plan gratis). Build `npm run build`, salida `dist`, variable `NODE_VERSION=22`. Se publica solo con cada commit a `main`.
- Panel de carga: Pages CMS (app.pagescms.org), configurado en `.pages.yml`. Cada guardado = un commit en `main` → Cloudflare republica en 1–2 min. **Por eso `main` recibe commits del panel todo el tiempo: antes de trabajar, traer lo último de `main`.**
- Videos: links de YouTube (subidos como "Oculto" con "Permitir insertar"), se cargan recién al tocar play vía youtube-nocookie.
- Cambios de código: por PR a `main`, no commits directos.

## Estructura

```
src/content/propiedades/*.md        una propiedad por archivo (frontmatter); el nombre del archivo es la URL
src/content.config.ts               esquema (tolera "" y null porque el panel los guarda así)
src/assets/uploads/                 fotos subidas desde el panel; se optimizan a WebP al compilar
src/data/sitio.json                 WhatsApp, dirección, textos de portada, quiénes somos y construcción
src/lib/sitio.ts                    lee sitio.json con valores por defecto; SIEMPRE importar { sitio } desde acá, nunca el JSON
src/lib/imagenes.ts                 resuelve fotos por NOMBRE DE ARCHIVO (no importa el prefijo de ruta que guarde el panel)
src/lib/propiedades.ts              orden, precio, topes del filtro de precio (USD/ARS), resumen, link de WhatsApp, ID de YouTube
src/lib/seo.ts                      JSON-LD schema.org: WebSite + RealEstateAgent (portada), RealEstateListing + BreadcrumbList (ficha)
src/components/OpcionesPrecio.astro opciones de "Precio hasta" (portada y catálogo)
src/components/Paisaje.astro        ilustración de sierras con la piedra "hito" cuando no hay foto
src/layouts/Base.astro              head común: canonical, og, robots (prop indexar), JSON-LD (prop datosEstructurados)
src/pages/index.astro               portada: hero, buscador (GET a /propiedades/), destacadas, construcción (#construccion, con encabezado "Cómo trabajamos"), quiénes somos (#nosotros), localidades, CTA
src/pages/propiedades/index.astro   catálogo: filtros por chips/selects sincronizados con la URL (?localidad=&tipo=&op=&dorm=&precio=&q=&vendidas=0) y orden
src/pages/propiedades/[id].astro    ficha: galería con scroll-snap + visor a pantalla completa (<dialog>), datos, video, mapa, consulta por WhatsApp
src/pages/robots.txt.ts             robots.txt generado (permite todo y nombra a los bots de IA; apunta al sitemap y a llms.txt)
src/pages/llms.txt.ts               resumen para asistentes de IA con contacto y todas las propiedades, generado en cada build
public/_headers                     seguridad, caché y noindex para *.pages.dev
public/_redirects                   redirecciones 301 de URLs viejas
```

## Identidad visual

Paleta: piedra `#98846C` (marca), piedra oscura `#806D59` (fondos con texto blanco), tierra `#5C4C3E`, carbón `#2F2822`, arena `#EDE6DC`, hueso `#F7F3EE` (fondo). Estados: disponible verde `#3D7A4E`, reservado ámbar `#C08A2E`, vendido = sello "VENDIDO" sobre la foto (las vendidas quedan visibles a propósito). Tipografía: Figtree (self-hosted con @fontsource). Logos en `src/assets/brand/` (oscuro y blanco, recortados con transparencia).

## Cómo funcionan algunas cosas

- **Galería de la ficha**: las fotos verticales (alto > ancho) se muestran enteras (`object-fit: contain`, clase `vertical`); las horizontales llenan el recuadro. Tocar una foto o el botón "Ver las N fotos" abre el visor a pantalla completa: muestra todo entero, flechas, teclado (← →, Esc), deslizar en el celular, y el botón "atrás" del celular lo cierra (usa `history.pushState`).
- **Filtro de precio**: el valor lleva la moneda (`usd-50000`, `ars-50000000`); un número solo (links viejos) se toma como dólares. Los topes en pesos aparecen solo si hay alguna propiedad en pesos. Al ordenar por precio: primero dólares, después pesos y al final "Consultar".
- **Quiénes somos**: textos en `sitio.json` (`nosotros_titulo`, `nosotros_texto`, `nosotros_firma`), editables desde el panel. Si `nosotros_texto` queda vacío, la sección no se muestra.
- **SEO / agentes**: canonical y og con el dominio oficial; `<meta name="robots">` (la 404 va con noindex); sitemap con @astrojs/sitemap; `robots.txt` y `llms.txt` generados; `X-Robots-Tag: noindex` en `*.pages.dev`.

## Cosas que muerden

- Pages CMS borra del JSON/frontmatter los campos vacíos. Todo campo debe ser opcional con valor por defecto (por eso existe `lib/sitio.ts`; si se suma un campo a `sitio.json`, sumarlo también ahí y en `.pages.yml`).
- La URL de cada propiedad sale del nombre del archivo, que el panel arma con el título al crearla. Si alguien edita una propiedad vieja en vez de crear una nueva, la URL queda vieja. Si se renombra un archivo, sumar la redirección en `public/_redirects`.
- Fotos: solo jpg/jpeg/png/webp/avif. Se buscan por nombre de archivo en minúsculas, así que dos fotos con el mismo nombre en carpetas distintas chocan.
- El `[hidden]` global tiene `display:none !important` porque varios componentes usan `display:flex`.
- El sello "VENDIDO" tiene `pointer-events: none` para no bloquear la galería ni los links.
- El menú del encabezado pasa a hamburguesa por debajo de 960 px (con 5 links no entra antes).
- No hay acceso a internet general desde las sesiones en la nube (pages.dev, Instagram, webs externas bloqueadas); pedirle al usuario capturas o archivos.
- Para probar en navegador en la nube: `npx astro preview` y Playwright global en `/opt/node-tools/node_modules/playwright` con `executablePath: '/opt/pw-browsers/chromium'`.

## Estado (11/10/2026)

Funcionando en Cloudflare con dominio propio y el panel en uso. Cargado: WhatsApp `5492302312807` (se muestra "2302 312807"), foto del local en la portada, foto de construcción con logo de Domus, sección Quiénes somos, y dos propiedades reales: "PREVENTA LOTEO VILLA TALLERES" (`/propiedades/preventa-loteo-villa-talleres/`, antes `ejemplo-casa-tres-dormitorios`, con 301) y "CASA DE BARRIO".

## Pendientes

1. Que el cliente complete desde el panel:
   - Financiación del loteo: dice "24" → "Hasta 24 cuotas".
   - Confirmar el teléfono: el cartel del local (foto de portada) dice 2302 596714 y el del lote dice 2302 312807, que es el WhatsApp configurado.
   - Loteo: aclarar que tiene lotes de 253/300/600/800 m² (¿precio "desde"?), y sumarle descripción y link de Google Maps.
   - Casa de barrio: le faltan superficie (total y cubierta) y link de Google Maps.
2. En Cloudflare:
   - Confirmar que el proyecto viejo (conectado a `matiascavallo/hito-inmobiliaria`) esté borrado.
   - Que `www` redirija al dominio principal.
   - Que el bloqueo de bots de IA / robots.txt administrado esté apagado.
   - Si `SITE_URL` tiene otro valor, corregirla o borrarla.
3. Dar de alta el sitio en Google Search Console (y Bing Webmaster Tools) y enviar `https://hitoinmobiliaria.com/sitemap-index.xml`.
4. Opcional, ofrecido: atajo `/admin` que redirija al panel (`public/_redirects` → `https://app.pagescms.org/gabrielgpanza/hito-inmobiliaria/main`).

## Comandos

```
npm install
npm run dev     # http://localhost:4321
npm run build   # dist/
npm run check   # tipos (tiene que dar 0 errores)
```
