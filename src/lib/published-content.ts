import { z } from 'zod';
import { contentSchema, type ContentResult } from '../types/content';
import { mockContent } from './mock';

const countSchema = z.object({ publishedDocumentCount: z.number().int().nonnegative() });

/** Una respuesta vacía es válida; datos publicados incompletos nunca se ocultan. */
export function resolvePublishedContent(raw: unknown): ContentResult {
  const { publishedDocumentCount } = countSchema.parse(raw);
  if (publishedDocumentCount === 0) {
    return {
      content: contentSchema.parse(mockContent),
      source: 'demo',
      cmsStatus: 'empty',
      warning: 'Contenido de demostración · La propuesta definitiva está en preparación.',
    };
  }
  const content = contentSchema.parse(raw);
  for (const slug of ['inicio', 'carta', 'restaurante', 'reservas']) {
    if (content.pages.filter(page => page.slug === slug).length !== 1) {
      throw new Error('Publica exactamente una página por ruta: inicio, carta, restaurante y reservas.');
    }
  }
  if (new Set(content.pages.map(p => p.slug)).size !== content.pages.length) throw new Error('Los slugs de páginas deben ser únicos.');
  if (content.dishes.some(dish => !content.categories.some(category => category._id === dish.categoryId))) {
    throw new Error('Publica las categorías referenciadas por los platos.');
  }
  return { content, source: 'sanity', cmsStatus: 'published' };
}
