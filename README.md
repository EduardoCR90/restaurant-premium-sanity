# Salitre — Restaurante Premium

Web editorial para un restaurante **ficticio** en Tenerife. Astro estático, TypeScript estricto y Sanity Studio independiente. Cuatro páginas, once propuestas de carta y una composición en marfil, carbón y terracota. No hay reservas activas ni backend de reservas.

## Fase 1: arquitectura reutilizable

Páginas estáticas creadas desde Sanity, diez tipos de bloque, navegación editorial, visibilidad de carta y configuración de identidad visual. Las cuatro composiciones originales de Salitre se conservan cuando sus páginas no tienen bloques.

Consulta [la guía de fase 1](docs/phase-1.md) para arquitectura, catálogo de bloques, creación de páginas, otro restaurante, temas, compatibilidad y preparación del dashboard. Los esquemas viven únicamente en [studio-salitre-restaurant](https://github.com/EduardoCR90/studio-salitre-restaurant).

El 30 de octubre de 2026 se verificó lectura de los 22 documentos publicados en hfa8zkyw/production y build con contenido real. [VALIDATION.md](VALIDATION.md) distingue comprobaciones locales, fixtures y pruebas pendientes. No se ha modificado contenido de producción ni desplegado esta fase.

## Instalación desde otro ordenador

Requiere Node.js 22.22+ (recomendado Node 22 LTS) y npm.

```bash
git clone https://github.com/EduardoCR90/restaurant-premium-sanity.git
cd restaurant-premium-sanity
# Cambia a la rama de la implementación si todavía no se ha integrado en main.
git switch codex/phase-1-dynamic-blocks
npm ci
cp .env.example .env
npm run dev
```

Abre http://localhost:4321/restaurant-premium-sanity/. Por defecto consulta hfa8zkyw/production. Si un dataset está vacío, usa `src/lib/mock.ts` con aviso de demostración. SANITY_USE_MOCK=true permite trabajar sin conexión. Las fotos de ejemplo usan Unsplash y necesitan conexión del navegador; los textos y carta no dependen de esa conexión. Son fotografías ambientales, no retratos de los platos o personas ficticias. Antes de un uso comercial, sustituye y verifica las licencias de todas las fotos.

Se incluye `package-lock.json`, recuperado de la instalación validada en GitHub Actions. Usa `npm ci` para reproducirla. CI conserva durante siete días el artefacto `salitre-static-review` con el HTML, lock, auditoría y capturas de revisión cuando Chrome está disponible. Las capturas no publican la web.

```bash
npm run dev           # Astro local
npm run check         # Astro/TypeScript (Studio se comprueba en su repositorio)
npm test              # Contratos, demo y seguridad de URLs
npm run build         # HTML estático en dist/
npm run preview       # Build local en http://localhost:4321/restaurant-premium-sanity/
npm run check:cms     # Lectura real: valida contenido o detecta dataset vacío
```

## Arquitectura

```text
src/
  components/     Composiciones originales, MenuSection y blocks/registry.ts
  layouts/        BaseLayout: HTML, SEO, navegación y aviso demo
  pages/          [...slug], 404, robots.txt, sitemap.xml
  styles/         global.css: tokens, capas CSS y responsive
  lib/            Acceso Sanity, adaptadores, páginas, carta y resolución de bloques
  types/          Contratos Zod y tipos inferidos
scripts/          Exportador NDJSON de contenido inicial
public/           Favicon
tests/           Validación de contratos y URLs
.github/workflows/validate.yml, deploy.yml
```

El Studio se ha trasladado, conservando sus esquemas, a [studio-salitre-restaurant](https://github.com/EduardoCR90/studio-salitre-restaurant), con su propio package.json, lock y CI. Es la fuente de verdad del modelo; no está incrustado en Astro ni duplicado aquí.

`getContent()` obtiene una instantánea reutilizada en build. El cliente oficial ejecuta una consulta GROQ con referencias resueltas, perspectiva `published`, sin CDN y sin reintentos. Zod valida la respuesta; además se comprueba que haya slugs únicos y una página por ruta original y que cada plato tenga categoría. Los componentes reciben datos tipados y nunca conocen tokens ni SDKs. El frontend solo añade el ClientRouter y prefetch nativos de Astro para navegar; no monta React ni islas del CMS.

Un dataset accesible sin documentos publicados utiliza demo automáticamente. Si hay documentos publicados, se valida el conjunto completo: configuración, historia, cuatro páginas originales únicas, nuevas páginas válidas y referencias coherentes. Una publicación incompleta o un error de red detiene la build y conserva el último despliegue correcto; no se mezcla contenido real con datos mock silenciosamente. SANITY_ALLOW_DEMO_FALLBACK=true es una alternativa explícita para incidencias, y SANITY_USE_MOCK=true desactiva el acceso remoto para desarrollo/CI.

## Sanity: configuración y edición desde el navegador

Proyecto existente **Salitre-restaurant**, ID **hfa8zkyw**, dataset **production**. La [guía de configuración](docs/sanity-setup.md) explica las variables, el Studio independiente, la primera publicación de contenido y el webhook de reconstrucción de GitHub Pages. No necesitas instalar nada en tu ordenador: Studio tiene un workflow manual de publicación en su repositorio. Hace falta configurar allí un secreto de automatización Sanity autorizado; no se solicita ni almacena en el código.

Se reutilizan los tipos settings, page, category, dish, story, gallery, editorialImage y seo. Los IDs singleton se conservan. Los datos de ejemplo y el exportador NDJSON siguen en Astro; no se ha importado ni sustituido contenido del dataset. Las fotografías deben subirse desde Studio cuando crees el contenido real.

## SEO, imágenes y reservas

Metadatos por página, canonical con `SITE_URL`, Open Graph, Twitter card, idioma español y robots.txt. El dominio .example, la demo y el restaurante ficticio incluyen `noindex, follow`. No se añaden datos estructurados de un negocio real a este ejemplo. Antes de publicar, sustituye dominio, identidad y contactos; revisa toda la información y desactiva `isFictional` solo cuando represente un negocio real.

`Photo.astro` genera srcsets con tamaños 480–2400 para Unsplash y el CDN de Sanity, usa `auto=format`, dimensiones HTML, lazy loading y prioridad alta para la imagen principal. Los assets originales de Sanity se sirven desde su CDN; no se descargan durante la build. Hay espacios reservados para las imágenes, estilos responsive, foco visible, salto al contenido y `prefers-reduced-motion`. La serif usa Georgia y fuentes del sistema: sin descargas externas de fuentes. El hotspot puede editarse en Studio pero esta versión usa recorte centrado CSS, no coordenadas de hotspot.

El botón de reservas solo aparece con fuente Sanity, `isFictional=false` y una URL HTTPS de proveedor real. El enlace abre el proveedor; no procesa pagos ni guarda datos. Sin proveedor hay un mensaje explícito, sin formulario falso. Los datos de contacto demo no generan enlaces de teléfono ni correo.

## Publicar contenido y reconstruir GitHub Pages

El workflow de Pages consulta contenido publicado de Sanity en cada build. Publicar contenido no cambia HTML ya generado: configura el webhook descrito en [docs/sanity-setup.md](docs/sanity-setup.md). Usa el endpoint workflow_dispatch con Authorization privado y permisos Actions:write limitados a este repositorio, sin un servidor adicional. El propietario confirma que el webhook está configurado y funciona; esta fase conserva su contrato y no ha disparado un nuevo despliegue. No se configura SiteGround.

## Validación y CI

GitHub Actions valida PRs y pushes a main: instalación, Astro/TypeScript, tests, build demo y pruebas de navegación. El Studio tiene CI y compilación propios en su repositorio. No despliega. También exporta la semilla y adjunta un informe `npm audit`; sus avisos deben revisarse antes de producción. El pipeline de demo no acredita conexión al CMS; `check:cms` y la build real se verifican por separado.

Las verificaciones actuales están en [VALIDATION.md](VALIDATION.md). Pendientes: Lighthouse/Core Web Vitals, lector de pantalla y revisión editorial de los bloques en Studio. La fase no dispara el webhook ni publica contenido para probarlo.

## Demo en GitHub Pages

URL objetivo: https://eduardocr90.github.io/restaurant-premium-sanity/ . La presencia del workflow no acredita una publicación: comprueba que el job `deploy` termine correctamente y abre la URL pública.

Configuración predeterminada de Astro: salida estática, `site: https://eduardocr90.github.io`, `base: /restaurant-premium-sanity` y barra final en las rutas. `src/lib/paths.ts` aplica `import.meta.env.BASE_URL` a enlaces internos y favicon; Astro aplica la base al CSS compilado. Las fotos HTTPS de Unsplash/Sanity y las fuentes del sistema conservan sus ubicaciones. Los canonical y Open Graph incluyen la ruta base. La demo mantiene noindex y las reservas inactivas.

`.github/workflows/deploy.yml` sigue las guías oficiales de [Astro](https://docs.astro.build/en/guides/deploy/github/) y [GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): `withastro/action@v6` instala, comprueba, genera y sube el artefacto; `actions/deploy-pages@v5` publica únicamente desde main con permisos Pages/OIDC y el entorno github-pages. La acción oficial detecta package-lock.json. El workflow consulta hfa8zkyw/production, con token de lectura opcional únicamente en los secretos de build. El dataset vacío mantiene la demo; cuando el contenido publicado esté completo se utiliza Sanity.

Configuración manual en GitHub:

1. Integra la PR que contiene el proyecto y este workflow en main cuando esté aprobada.
2. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**. No selecciones una rama de publicación ni añadas un CNAME.
3. Si el repositorio es privado, comprueba que tu plan permita Pages en repositorios privados. No se cambia la visibilidad del repositorio automáticamente.
4. Comprueba que Actions permita las acciones oficiales y que el entorno `github-pages` permita desplegar desde main. Si tiene revisores obligatorios, aprueba el despliegue en GitHub.
5. La integración en main inicia el workflow. Si has activado Pages después, ejecuta **Actions → Deploy demo to GitHub Pages → Run workflow → main**, o reejecuta el job fallido de despliegue.
6. Comprueba el resultado de `deploy`, abre la URL y navega a carta, restaurante y reservas desde el móvil. Las fotografías remotas requieren acceso a sus CDN.

Sin tocar credenciales, puedes reproducir la build con `npm ci`, `npm run build`, `npm run check:build` y `npm run preview`. La comprobación de build verifica rutas, recursos locales, anclas, navegación activa y canonical de las cuatro páginas bajo la base. CI sirve las capturas bajo la misma subruta y limita cada ejecución de Chrome a 30 segundos.

Para mover el proyecto en el futuro a un dominio sin subcarpeta, configura SITE_URL y SITE_BASE=/ en el entorno de build y de check:build; no elimines manualmente los prefijos de cada componente.

## Navegación y vista previa al compartir

El layout compartido monta `ClientRouter` de `astro:transitions`. El root y la cabecera no se animan; solo el contenido usa `fade({ duration: '300ms' })`, también al recorrer el historial. La cabecera se reemplaza con el HTML actualizado sin animación para conservar `aria-current` correcto: no se persiste un menú con estado obsoleto. El menú móvil continúa siendo una fila de enlaces nativos, sin scripts de apertura/cierre. No se requieren listeners de `astro:page-load` de producto; si se añaden nuevas interacciones, inicialízalas en ese evento evitando duplicar listeners.

Prefetch es opt-in en navegación y CTA: `prefetchAll: false`, estrategia hover/foco y atributo data-astro-prefetch. No se precargan todas las páginas al entrar ni enlaces externos/anclas; Astro cambia a tap con ahorro de datos o conexión lenta. No se ignora la detección de red. El router mantiene sus anuncios accesibles y respeta movimiento reducido, con una regla adicional para los pseudoelementos de View Transitions. Sin JS sigue disponible la navegación HTML; sin la API nativa se usa el fallback de Astro.

El head ordena charset, viewport, título/descripción/canonical, robots/presentación, Open Graph/Twitter y recursos/router. Los metadatos se generan en HTML estático y se actualizan durante las transiciones. La imagen por defecto `public/og-default.jpg` es un JPEG progresivo 1200×630 (aprox. 146 KiB), servido desde la base de GitHub Pages con URL HTTPS absoluta, tipo, dimensiones y texto alternativo. Se usa la misma fotografía de demostración del hero de Unsplash, identificador photo-1414235077428-338989a2e8c0. El campo SEO de imagen de Sanity tiene prioridad cuando está configurado y publicado; no se inventan sus dimensiones.

Las redes pueden cachear una vista previa anterior: tras desplegar, solicita una nueva lectura en el inspector de compartir de la plataforma correspondiente. Que los metadatos y la imagen respondan correctamente no acredita el resultado de todas las apps de mensajería.

`node scripts/check-navigation.mjs` prueba las cuatro páginas en Chromium, historial, CTA, anclas, cabecera estable, metadatos, imágenes, errores JS, fallback sin View Transitions, movimiento reducido, ahorro de datos y navegación sin JS. CI instala Playwright temporalmente fuera del proyecto y usa Chrome ya instalado; no se añade ninguna dependencia al producto o al lockfile. Para reproducirlo: instala playwright@1.56.1 en un directorio temporal, ejecuta npm run build y npm run preview y define PLAYWRIGHT_MODULE con la URL file:// de su index.mjs; CHROME_BIN permite seleccionar el ejecutable. TEST_ORIGIN permite ejecutar el mismo recorrido contra un servidor publicado.
