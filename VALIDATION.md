# Validación — 24 octubre 2026

## Comprobaciones locales

- GitHub y registry.npmjs.org: una consulta a cada destino, ambas fallaron al conectar con el proxy configurado (curl código 7). No se reintentó la red de terminal.
- `npm install --offline --ignore-scripts --no-audit --no-fund`: ENOTCACHED; no existe caché de @astrojs/check. No se ha generado lockfile.
- `node --check astro.config.mjs`: correcto.
- Ejecución real del módulo mock con Node 24 y comprobaciones assert: correcto. Cuatro páginas únicas, cuatro categorías, once platos, precios positivos, referencias de categorías existentes, SEO presente y reservas demo desactivadas.
- Validación JSON de package.json y tsconfig y resolución de imports locales: correcta.
- `git diff --check`: correcto.
- `npm run check`: bloqueado, `astro: not found`.
- `npm test`: bloqueado, falta `tsx`; no ha podido ejecutar las pruebas Zod. No se considera aprobado.
- `npm run build`: bloqueado, `astro: not found`.
- `npm run studio:build`: bloqueado, `sanity: not found`.

## GitHub y CI

El conector de GitHub dispone de acceso independiente de la terminal. La implementación se entrega en la rama `codex/salitre-astro-sanity`, mediante PR para revisión. El workflow valida Astro, Sanity, contratos y builds sin despliegue. Su resultado debe comprobarse en la PR; los resultados locales anteriores no constituyen una build aprobada.

## Pendiente

Instalación con npm y generación de package-lock.json; resultados de CI; comprobación visual de las cuatro páginas con fotos cargadas en móvil y escritorio; teclado, contraste y lector de pantalla; Lighthouse/Core Web Vitals. Configuración y verificación real de Sanity, importación de ejemplo, subida de fotos y ciclo publicar → reconstruir. Integración del proveedor de reservas y futura elección de hosting. SiteGround no se ha configurado ni se ha desplegado.
