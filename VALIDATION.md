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

Reproducir instalación local con npm ci; comprobación visual de las cuatro páginas con fotos cargadas en móvil y escritorio; teclado, contraste y lector de pantalla; Lighthouse/Core Web Vitals. Configuración y verificación real de Sanity, importación de ejemplo, subida de fotos y ciclo publicar → reconstruir. Integración del proveedor de reservas y futura elección de hosting. SiteGround no se ha configurado ni se ha desplegado.

## Actualización verificada

La ejecución [40090623135](https://github.com/EduardoCR90/restaurant-premium-sanity/actions/runs/40090623135) pasó con Astro 7.4.1, Sanity 6.20.0 y Zod 4.6.7: tipos, tres tests, cuatro páginas estáticas, exportador de semilla, build no interactiva de Studio e index.html presente. Se recuperó el package-lock.json de su artefacto y se fijó Node >=22.22 según los engines reales de Astro. CI usa ahora npm ci y caché npm.

Auditoría completa de ese lock: 0 críticas, 3 altas y 10 moderadas. Los avisos restantes afectan a herramientas transitivas de Sanity (js-yaml, smol-toml, undici y uuid, más sus cadenas). No se ha aplicado un downgrade mayor automático de Sanity ni overrides que cambien APIs sin probar. Deben revisarse antes de publicar Studio; la auditoría de dependencias de producción se comprueba separadamente en el workflow final.

Se inspeccionó el HTML construido descargado de CI: un h1 por página, enlaces locales y anclas válidos, alt y dimensiones en imágenes y ausencia de scripts del cliente. La terminal bloquea sockets locales y Chromium (setsockopt: Operation not permitted), por lo que la inspección visual local no se pudo realizar. CI intenta adjuntar capturas de las cuatro páginas para revisión sin desplegar; si falla ese paso opcional, no acredita una revisión visual. Lighthouse y prueba de CMS real siguen pendientes.

## Preparación de GitHub Pages

Se conserva todo el proyecto existente y package-lock.json. Se configura site/base para la URL solicitada, se reemplazan enlaces absolutos y favicon mediante BASE_URL y se añade deploy.yml con la acción oficial de Astro. Se añade `npm run check:build` para comprobar el HTML real generado bajo la subruta, no solo los fuentes. El workflow de validación usa esa misma base en sus capturas y limita el tiempo de Chrome.

En la terminal, `node --check astro.config.mjs`, `node --check scripts/check-build.mjs` y `git diff --check` pasan. `npm run build` sigue bloqueado localmente por dependencias ausentes y el proxy inaccesible. Se ejecutará en Actions para validar la revisión de Pages. La publicación solo se considera verificada tras comprobar el job deploy y una respuesta pública válida; puede requerir activar Pages manualmente en Settings.

## Navegación nativa y metadatos sociales

Se añade ClientRouter, fade de 300 ms solo en main, cabecera sin animación y prefetch opt-in que respeta ahorro de datos. Se completa el head y se incorpora un JPEG social local 1200×630 (148957 bytes aproximadamente), conservando la prioridad del SEO publicado en Sanity.

Build local, check:build, tres tests y Astro/TypeScript completados correctamente (0 errores, 0 warnings, 2 hints preexistentes de Zod). Primer recorrido real de Chromium aprobado en escritorio, móvil, movimiento reducido, fallback sin View Transitions y navegación HTML sin JavaScript: cuatro páginas, historial, CTA, anclas, cabecera estable, metadatos actualizados, fotos y ausencia de errores JS. Se amplía el test para prefetch/ahorro de datos y se incorpora a CI con Playwright temporal, fuera del producto.

La publicación y la descarga HTTP de la imagen social se comprueban después de integrar la PR. No se atribuye una vista previa de WhatsApp, Facebook o X sin probar cada plataforma: pueden conservar su propia caché.

## Proyecto Sanity real y Studio separado

Skill sanity-best-practices instalada con npx skills add sanity-io/agent-toolkit --skill sanity-best-practices -y. Leídas get-started, Astro, estructura de proyectos y automatizaciones. Se continúa el modelo existente sin crear un proyecto alternativo.

Lectura real de hfa8zkyw/production: HTTP 200, cero documentos publicados. Check:cms y build local conectada: cmsStatus empty, fuente demo, cuatro páginas y once platos de respaldo. Seis tests aprobados, tipos sin errores y check:build correcto. El fixture de publicación no equivale a publicar contenido real.

Studio comprobado con su propio package.json, lockfile, tsc y sanity build. Los esquemas migrados coinciden con los existentes. Se prepara CI y publicación manual independiente; no se ha desplegado Studio ni schema sin autenticación, ni importado contenido. Webhook directo a workflow_dispatch documentado y receptor preparado; no activado ni probado con una publicación real. Ver docs/sanity-setup.md y las PRs de ambos repositorios para los resultados finales de CI/despliegue.
