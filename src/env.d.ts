/// <reference types="astro/client" />
interface ImportMetaEnv {
 readonly SANITY_USE_MOCK?: string;
 readonly SANITY_PROJECT_ID?: string;
 readonly SANITY_DATASET?: string;
 readonly SANITY_API_READ_TOKEN?: string;
 readonly SANITY_ALLOW_DEMO_FALLBACK?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
