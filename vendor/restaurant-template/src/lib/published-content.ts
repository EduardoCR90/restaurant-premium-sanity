import { z } from "zod";
import {
  contentSchema,
  type Content,
  type ContentResult,
} from "../types/content";
const countSchema = z.object({
  publishedDocumentCount: z.number().int().nonnegative(),
});
export function resolvePublishedContent(
  raw: unknown,
  options: { fallback?: Content; requiredSlugs?: string[] } = {},
): ContentResult {
  const { publishedDocumentCount } = countSchema.parse(raw);
  if (publishedDocumentCount === 0) {
    if (!options.fallback)
      throw new Error(
        "Empty dataset: configure explicit demo content or publish content",
      );
    return {
      content: contentSchema.parse(options.fallback),
      source: "demo",
      cmsStatus: "empty",
      warning:
        "Contenido de demostración · La propuesta definitiva está en preparación.",
    };
  }
  const content = contentSchema.parse(raw);
  for (const slug of options.requiredSlugs || [])
    if (content.pages.filter((p) => p.slug === slug).length !== 1)
      throw new Error("Falta una página requerida por la instancia");
  if (new Set(content.pages.map((p) => p.slug)).size !== content.pages.length)
    throw new Error("Los slugs de páginas deben ser únicos.");
  if (
    content.dishes.some(
      (d) => !content.categories.some((c) => c._id === d.categoryId),
    )
  )
    throw new Error("Publica las categorías referenciadas por los platos.");
  return { content, source: "sanity", cmsStatus: "published" };
}
