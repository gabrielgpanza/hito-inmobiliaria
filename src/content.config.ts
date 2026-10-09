import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// El panel puede guardar campos vacíos como "" o null: los tratamos como "sin dato".
const vacio = (v: unknown) => (v === '' || v === null ? undefined : v);
const texto = z.preprocess(vacio, z.string().optional());
const numero = z.preprocess(vacio, z.coerce.number().optional());
const lista = z.preprocess((v) => (Array.isArray(v) ? v.filter((x) => x !== '' && x != null) : []), z.array(z.string()));

const propiedades = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/propiedades' }),
  schema: z.object({
    titulo: z.string(),
    estado: z.preprocess(
      (v) => (typeof v === 'string' ? v.toLowerCase() : v),
      z.enum(['disponible', 'reservado', 'vendido']).default('disponible'),
    ),
    operacion: z.preprocess(vacio, z.string().default('Venta')),
    tipo: z.preprocess(vacio, z.string().default('Lote')),
    localidad: z.string(),
    ubicacion: texto,
    precio: numero,
    moneda: z.preprocess(vacio, z.enum(['USD', 'ARS']).default('USD')),
    financiacion: texto,
    superficie_total: numero,
    superficie_cubierta: numero,
    medidas: texto,
    dormitorios: numero,
    banos: numero,
    servicios: lista,
    escritura: texto,
    descripcion: texto,
    fotos: lista,
    video: texto,
    mapa: texto,
    destacada: z.preprocess(vacio, z.boolean().default(false)),
    fecha: z.preprocess(vacio, z.coerce.date().optional()),
  }),
});

export const collections = { propiedades };
