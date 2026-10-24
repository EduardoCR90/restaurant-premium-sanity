import { createClient } from '@sanity/client';

// Este módulo solo se importa desde la capa de build, nunca desde scripts del cliente.
type ContentEnvironment = {
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  SANITY_API_READ_TOKEN?: string;
};
export function createContentClient(env: ContentEnvironment = import.meta.env) {
  return createClient({
    projectId: env.SANITY_PROJECT_ID || 'hfa8zkyw',
    dataset: env.SANITY_DATASET || 'production',
    apiVersion: '2025-02-19',
    perspective: 'published',
    useCdn: false,
    token: env.SANITY_API_READ_TOKEN || undefined,
    timeout: 15000,
    maxRetries: 0,
  });
}
