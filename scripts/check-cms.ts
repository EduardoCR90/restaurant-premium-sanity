import { createContentClient } from '../src/lib/sanity.server';
import { restaurantQuery } from '../src/lib/queries';
import { resolvePublishedContent } from '../src/lib/published-content';

try {
  const client = createContentClient(process.env);
  const result = resolvePublishedContent(await client.fetch<unknown>(restaurantQuery));
  console.log(JSON.stringify({
    projectId: client.config().projectId,
    dataset: client.config().dataset,
    cmsStatus: result.cmsStatus,
    renderedSource: result.source,
    pages: result.content.pages.length,
    dishes: result.content.dishes.length,
  }));
} catch {
  console.error('Sanity no accesible o contenido publicado inválido. No se imprimen tokens ni cabeceras.');
  process.exitCode = 1;
}
