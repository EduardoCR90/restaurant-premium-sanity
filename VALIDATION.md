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

El conector de GitHub dispone de acceso independiente de la terminal. La implementación se entrega en la rama `codex/salitre-astro-sanity`, mediante PR para revisión. El workflow valida Astro, Sanity, contratos y builds sin despliegue. La primera ejecución [40090104188](https://github.com/EduardoCR90/restaurant-premium-sanity/actions/runs/40090104188), commit 13aa5c8, completó correctamente instalación, Astro/TypeScript (19 archivos, 0 errores, 0 avisos), los tres tests Zod, build estática (cuatro páginas) y build de Studio. La última revisión debe comprobarse por separado en la PR.

La compilación inicial de Studio detectó styled-components ausente y lo instaló automáticamente; se corrigió declarándolo expresamente. También se separó su directorio de salida de Astro. El log inicial informó de 12 avisos de auditoría de dependencias (incluido uno crítico); el workflow actualizado adjunta el informe completo para identificar versiones y correcciones. Una build aprobada no implica una auditoría sin avisos. El informe detallado identificó versiones anteriores de Astro, Sanity y Zod como origen; se actualizaron a las versiones estables corregidas sugeridas por npm audit (Astro 7.4.1, Sanity 6.20.0 y Zod 4.6.7). Se añadió --yes a la build de Studio y comprobación explícita de su index.html para impedir que un prompt termine con código 0 sin compilar. La actualización completa debe superar CI y su auditoría.

## Pendiente

Instalación con npm y generación de package-lock.json; resultados de CI; comprobación visual de las cuatro páginas con fotos cargadas en móvil y escritorio; teclado, contraste y lector de pantalla; Lighthouse/Core Web Vitals. Configuración y verificación real de Sanity, importación de ejemplo, subida de fotos y ciclo publicar → reconstruir. Integración del proveedor de reservas y futura elección de hosting. SiteGround no se ha configurado ni se ha desplegado.
