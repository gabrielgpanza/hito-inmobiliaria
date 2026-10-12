# Hito · Desarrollos Inmobiliarios

Sitio web de Hito: una vidriera de terrenos y propiedades con buscador, filtros y consultas directas por WhatsApp.

Dirección oficial: **https://hitoinmobiliaria.com**

- **Sitio estático** hecho con [Astro](https://astro.build). No hay servidor ni base de datos.
- **Propiedades**: un archivo por propiedad en `src/content/propiedades/`.
- **Fotos**: en `src/assets/uploads/`. Se optimizan solas al publicar (se achican y pasan a WebP).
- **Panel de carga**: [Pages CMS](https://pagescms.org), configurado en `.pages.yml`.
- **Alojamiento**: Cloudflare Pages (plan gratuito). Se publica solo con cada cambio en GitHub.

## Páginas

| Ruta | Qué muestra |
|---|---|
| `/` | Portada: buscador, destacadas, quiénes somos, construcción a medida, localidades y contacto |
| `/propiedades/` | Catálogo con filtros (localidad, tipo, dormitorios, precio, texto, vendidas) y orden |
| `/propiedades/<nombre>/` | Ficha: galería (con visor a pantalla completa), datos, descripción, video, mapa y consulta armada para WhatsApp |
| `/robots.txt` | Permisos para buscadores y asistentes de IA (se genera solo) |
| `/llms.txt` | Resumen del sitio y de todas las propiedades para asistentes de IA (se genera solo) |
| `/sitemap-index.xml` | Mapa del sitio para Google (se genera solo) |

Los filtros quedan en la dirección (ej: `/propiedades/?localidad=Huinca%20Renancó&tipo=Lote`), así que un resultado de búsqueda se puede compartir.

El filtro **Precio hasta** separa dólares y pesos (`?precio=usd-50000` o `?precio=ars-50000000`): una propiedad en pesos aparece cuando se elige un tope en pesos. Los topes en pesos se muestran solo si hay alguna propiedad publicada en pesos. Al ordenar por precio van primero las de dólares, después las de pesos y al final las que dicen "Consultar".

## Buscadores y asistentes de IA (SEO)

- Cada página tiene dirección canónica, descripción y vista previa para compartir, siempre con `https://hitoinmobiliaria.com`.
- **Datos estructurados** (schema.org): la portada describe a la inmobiliaria (`RealEstateAgent`) y cada ficha describe el aviso (`RealEstateListing`), con precio, moneda, estado, fotos y características.
- **`robots.txt`** permite todo, y nombra uno por uno a los asistentes de IA (ChatGPT, Claude, Perplexity, Gemini, Apple…) para dejar claro que pueden leer el sitio.
- **`llms.txt`** es un resumen en texto con los datos de contacto y todas las propiedades. Se rearma solo con cada publicación.
- Las direcciones de Cloudflare (`*.pages.dev`) mandan `noindex`, para que Google muestre solo el dominio oficial.
- La página de error (404) no se indexa.
- Si cambia la dirección de una propiedad, conviene sumar una redirección en `public/_redirects` (ver el ejemplo que ya está).

## Publicar en Cloudflare (una sola vez)

1. Entrar a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** y elegir este repositorio.
2. Configuración de build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
3. En **Settings → Variables**, agregar:
   - `NODE_VERSION` = `22`
   - `SITE_URL` (opcional) = `https://hitoinmobiliaria.com`. Si no está, se usa esa misma dirección, que ya figura en `astro.config.mjs`.
4. En **Custom domains**, agregar `hitoinmobiliaria.com` (y `www.hitoinmobiliaria.com`, redirigido al principal).
5. En la configuración del dominio en Cloudflare, revisar que **no** esté activado el bloqueo de bots de IA (*AI Crawl Control* / *Block AI bots*) ni el `robots.txt` administrado por Cloudflare, para que valga el del sitio.

A partir de ahí, cada cambio guardado en la rama principal se publica solo en uno o dos minutos.

## Panel de carga (Pages CMS)

1. Entrar a [app.pagescms.org](https://app.pagescms.org) con la cuenta de GitHub que tiene acceso a este repositorio.
2. La primera vez, instalar la app de Pages CMS en el repositorio cuando lo pida.
3. Abrir el repositorio y elegir la rama que publica Cloudflare (la principal).
4. Aparecen dos secciones: **Propiedades** y **Datos del sitio** (WhatsApp, dirección y los textos de la portada, incluido **Quiénes somos**).

**Cargar una propiedad:** *Propiedades → Add an entry*, completar los campos, subir las fotos (la primera es la portada) y guardar.
**Marcar como vendida o reservada:** abrir la propiedad, cambiar **Estado** y guardar. La vendida queda visible con el sello "VENDIDO". Si se quiere sacar del todo, se borra.
**Sumar a otra persona:** desde la configuración del repositorio en Pages CMS o como colaboradora en GitHub (*Settings → Collaborators*). Para quitarle el acceso, se la saca de esa lista.

### Consejos para quien carga

- **Fotos**: mejor horizontales y bien iluminadas, en JPG, PNG o WebP. Las verticales (por ejemplo un plano) también sirven: se muestran enteras, sin recortar, y al tocar cualquier foto se abre a pantalla completa. No hace falta achicarlas, el sitio lo hace solo, pero conviene que pesen menos de 10 MB cada una. Desde el iPhone, subirlas desde el navegador las convierte solas a JPG. No subir dos fotos con el mismo nombre de archivo.
- **Propiedad nueva = entrada nueva**: la dirección de cada propiedad sale del título con el que se creó. Para publicar otra propiedad, usar *Add an entry*; no reescribir una vieja.
- **Localidad**: escribirla siempre igual (con tilde), porque el filtro agrupa por ese texto.
- **Precio**: solo el número, sin puntos ni "USD" (ej: `18000`). Vacío = "Consultar".
- **Video**: subirlo a YouTube como **Oculto**, revisar que **Permitir insertar** esté activado y pegar el link.
- **Descripción**: una línea en blanco separa párrafos.

## Trabajar en el código

Se necesita Node 22 o más nuevo.

```sh
npm install
npm run dev      # sitio en http://localhost:4321 que se actualiza al guardar
npm run build    # genera el sitio final en dist/
npm run check    # revisa errores de tipos
```

### Estructura

```
src/
  content/propiedades/   una propiedad por archivo (.md)
  assets/uploads/        fotos subidas desde el panel
  assets/brand/          logos
  data/sitio.json        WhatsApp, dirección, textos de portada y quiénes somos
  lib/sitio.ts           lee sitio.json con valores por defecto (el panel borra los campos vacíos)
  lib/propiedades.ts     orden, precios, filtro de precio, link de WhatsApp
  lib/imagenes.ts        busca las fotos por nombre de archivo
  lib/seo.ts             datos estructurados (schema.org) para buscadores y asistentes de IA
  components/            encabezado, pie, tarjeta, opciones de precio, ilustración
  layouts/Base.astro     estructura común, etiquetas para compartir y SEO
  pages/                 portada, catálogo, ficha, 404, robots.txt y llms.txt
  styles/global.css      colores, tipografía y estilos compartidos
public/                  favicon, imagen para compartir, _headers y _redirects de Cloudflare
.pages.yml               campos del panel de carga
```
