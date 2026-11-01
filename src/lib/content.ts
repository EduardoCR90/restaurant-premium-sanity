import { recordDeploymentEvidence } from '../../scripts/deployment-evidence';
import { contentSchema, type ContentResult } from '../types/content';
import { mockContent } from './mock';
import { restaurantQuery } from './queries';
import { createContentClient } from './sanity.server';
import { resolvePublishedContent } from './published-content';

let snapshot: Promise<ContentResult> | undefined;
async function load(): Promise<ContentResult> {
  if (import.meta.env.SANITY_USE_MOCK === 'true') {
    return { content: contentSchema.parse(mockContent), source: 'demo', cmsStatus: 'disabled' };
  }
  try {
    const raw = await createContentClient().fetch<unknown>(restaurantQuery);
    // Misma respuesta GROQ que genera el HTML. Solo huellas, nunca documentos ni tokens.
    await recordDeploymentEvidence(import.meta.env.SANITY_PROJECT_ID || 'hfa8zkyw', import.meta.env.SANITY_DATASET || 'production', raw);
    const result = resolvePublishedContent(raw);
    console.info(`[content] Sanity: ${result.cmsStatus === 'empty' ? 'dataset accesible sin contenido publicado; demo visible' : 'contenido publicado validado'}.`);
    return result;
  } catch {
    // No registrar objetos del SDK: pueden incluir cabeceras o respuestas privadas.
    if (import.meta.env.SANITY_ALLOW_DEMO_FALLBACK === 'true') {
      console.warn('[content] Sanity no disponible o datos inválidos; alternativa DEMO explícita.');
      return {
        content: contentSchema.parse(mockContent), source: 'demo', cmsStatus: 'error',
        warning: 'Se muestra contenido de demostración temporalmente.',
      };
    }
    throw new Error('No se pudo validar Sanity. Revisa conexión, permisos y contenido publicado completo. Se conserva el último despliegue. SANITY_ALLOW_DEMO_FALLBACK=true permite demo explícita; SANITY_USE_MOCK=true permite desarrollo sin conexión.');
  }
}
export function getContent(): Promise<ContentResult> { return snapshot ??= load(); }
