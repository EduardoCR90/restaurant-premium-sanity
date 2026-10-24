/** Rutas internas y recursos locales bajo la base configurada en Astro. */
export function pathFor(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}
