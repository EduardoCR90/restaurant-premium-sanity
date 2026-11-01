import type { BuildEnvironment } from "@restaurant-platform/astro-template/config";
// Astro inlines server variables only when each property is accessed explicitly.
// This module is imported exclusively by build/server data entry points.
export function readBuildEnvironment(): BuildEnvironment {
  return {
    SITE_URL: import.meta.env.SITE_URL,
    SITE_BASE: import.meta.env.SITE_BASE,
    SANITY_PROJECT_ID: import.meta.env.SANITY_PROJECT_ID,
    SANITY_DATASET: import.meta.env.SANITY_DATASET,
    SANITY_USE_MOCK: import.meta.env.SANITY_USE_MOCK,
    SANITY_ALLOW_DEMO_FALLBACK: import.meta.env.SANITY_ALLOW_DEMO_FALLBACK,
    SANITY_API_READ_TOKEN: import.meta.env.SANITY_API_READ_TOKEN,
  };
}
