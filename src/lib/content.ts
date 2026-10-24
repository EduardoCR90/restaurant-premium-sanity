import { createClient } from '@sanity/client';
import { contentSchema, type ContentResult } from '../types/content';
import { mockContent } from './mock';
import { restaurantQuery } from './queries';
let snapshot: Promise<ContentResult> | undefined;
async function load(): Promise<ContentResult> {
 const projectId = import.meta.env.SANITY_PROJECT_ID;
 const dataset = import.meta.env.SANITY_DATASET;
 if (!projectId && !dataset) return { content: contentSchema.parse(mockContent), source: 'demo' };
 // El dataset predeterminado sin projectId mantiene el modo de demostración.
 if (!projectId && (!dataset || dataset === 'production')) return { content: contentSchema.parse(mockContent), source: 'demo' };
 try {
  if (!projectId || !dataset) throw new Error('Configuración de Sanity incompleta');
  const client = createClient({ projectId, dataset, apiVersion: '2025-02-19', useCdn: false, perspective: 'published', token: import.meta.env.SANITY_API_READ_TOKEN, timeout: 15000, maxRetries: 0 });
  const content = contentSchema.parse(await client.fetch<unknown>(restaurantQuery));
  for (const slug of ['inicio','carta','restaurante','reservas']) {
   if (content.pages.filter(page => page.slug === slug).length !== 1) throw new Error('Páginas obligatorias ausentes o duplicadas');
  }
  if (content.dishes.some(dish => !content.categories.some(category => category._id === dish.categoryId))) throw new Error('Categoría de plato ausente');
  return { content, source: 'sanity' };
 } catch {
  // No registrar errores del SDK que puedan contener cabeceras o datos privados.
  if (import.meta.env.SANITY_ALLOW_DEMO_FALLBACK === 'true') {
   console.warn('[content] Sanity no disponible o contenido inválido; se usa DEMO explícita.');
   return { content: contentSchema.parse(mockContent), source: 'demo', warning: 'El CMS no está disponible. Se muestra contenido de demostración.' };
  }
  throw new Error('No se pudo cargar Sanity: revisa configuración, conectividad y documentos publicados. Para desarrollo puedes activar SANITY_ALLOW_DEMO_FALLBACK=true.');
 }
}
export function getContent(): Promise<ContentResult> { return snapshot ??= load(); }
export function formatPrice(value: number): string { return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits: 2 }).format(value); }
