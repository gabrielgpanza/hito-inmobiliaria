# Hito · Desarrollos Inmobiliarios

Sitio web de Hito: una vidriera de terrenos y propiedades con buscador, filtros y consultas directas por WhatsApp.

- **Sitio estático** hecho con [Astro](https://astro.build). No hay servidor ni base de datos.
- **Propiedades**: un archivo por propiedad en `src/content/propiedades/`.
- **Fotos**: en `src/assets/uploads/`. Se optimizan solas al publicar (se achican y pasan a WebP).
- **Panel de carga**: [Pages CMS](https://pagescms.org), configurado en `.pages.yml`.
- **Alojamiento**: Cloudflare Pages (plan gratuito). Se publica solo con cada cambio en GitHub.

## Páginas

| Ruta | Qué muestra |
|---|---|
| `/` | Portada: buscador, destacadas, cómo trabajamos, construcción a medida, localidades y contacto |
| `/propiedades/` | Catálogo con filtros (localidad, tipo, dormitorios, precio, texto, vendidas) y orden |
| `/propiedades/<nombre>/` | Ficha: galería, datos, descripción, video, mapa y consulta armada para WhatsApp |

Los filtros quedan en la dirección (ej: `/propiedades/?localidad=Huinca%20Renancó&tipo=Lote`), así que un resultado de búsqueda se puede compartir.

## Antes de publicar

1. En `src/data/sitio.json` (o en el panel, en **Datos del sitio**), completar el número de WhatsApp en formato internacional (ej: `5493385123456`) y cómo se muestra.
2. Borrar las 4 propiedades de ejemplo (las que dicen "(ejemplo)") y cargar las reales.
3. Opcional: subir una foto para la portada y otra para la sección de construcción.

## Publicar en Cloudflare (una sola vez)

1. Entrar a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** y elegir este repositorio.
2. Configuración de build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
3. En **Settings → Variables**, agregar:
   - `NODE_VERSION` = `22`
   - `SITE_URL` = la dirección final, ej: `https://hito.com.ar` (se usa en el mapa del sitio y en las vistas previas de WhatsApp)
4. En **Custom domains**, agregar el dominio. Si es `.com.ar`, se registra en [NIC Argentina](https://nic.ar) y ahí se cargan los servidores DNS que indique Cloudflare.

A partir de ahí, cada cambio guardado en la rama principal se publica solo en uno o dos minutos.

## Panel de carga (Pages CMS)

1. Entrar a [app.pagescms.org](https://app.pagescms.org) con la cuenta de GitHub que tiene acceso a este repositorio.
2. La primera vez, instalar la app de Pages CMS en el repositorio cuando lo pida.
3. Abrir el repositorio y elegir la rama que publica Cloudflare (la principal).
4. Aparecen dos secciones: **Propiedades** y **Datos del sitio**.

**Cargar una propiedad:** *Propiedades → Add an entry*, completar los campos, subir las fotos (la primera es la portada) y guardar.
**Marcar como vendida o reservada:** abrir la propiedad, cambiar **Estado** y guardar. La vendida queda visible con el sello "VENDIDO". Si se quiere sacar del todo, se borra.
**Sumar a otra persona:** desde la configuración del repositorio en Pages CMS o como colaboradora en GitHub (*Settings → Collaborators*). Para quitarle el acceso, se la saca de esa lista.

### Consejos para quien carga

- **Fotos**: horizontales y bien iluminadas, en JPG, PNG o WebP. No hace falta achicarlas, el sitio lo hace solo, pero conviene que pesen menos de 10 MB cada una. Desde el iPhone, subirlas desde el navegador las convierte solas a JPG.
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
  data/sitio.json        WhatsApp, dirección, textos de portada
  components/            encabezado, pie, tarjeta, ilustración
  layouts/Base.astro     estructura común y etiquetas para compartir
  pages/                 portada, catálogo, ficha y 404
  styles/global.css      colores, tipografía y estilos compartidos
public/                  favicon, imagen para compartir, encabezados de Cloudflare
.pages.yml               campos del panel de carga
```
