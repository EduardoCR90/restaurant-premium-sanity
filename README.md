# Salitre — Restaurante Premium

Web editorial para un restaurante **ficticio** en Tenerife. Astro estático, TypeScript estricto y Sanity Studio independiente. Cuatro páginas, once propuestas de carta y una composición en marfil, carbón y terracota. No hay reservas activas ni backend de reservas.

## Estado de esta entrega

Implementación fuente completa. El entorno no pudo conectar con el proxy al consultar GitHub/npm y no tiene las dependencias en caché. La primera ejecución de GitHub Actions ha superado Astro/TypeScript (0 errores y avisos), tres tests, build estática de las cuatro páginas y compilación de Studio. Las revisiones posteriores vuelven a pasar por CI. No hay credenciales de Sanity; **la conexión a un dataset real no se ha probado**. La demo está publicada en GitHub Pages; su estado se comprueba en el workflow de despliegue. Consulta `VALIDATION.md` para los resultados verificables y las comprobaciones pendientes.

## Instalación desde otro ordenador

Requiere Node.js 22.22+ (recomendado Node 22 LTS) y npm.

```bash
git clone https://github.com/EduardoCR90/restaurant-premium-sanity.git
cd restaurant-premium-sanity
# Cambia a la rama de la implementación si todavía no se ha integrado en main.
git switch codex/salitre-astro-sanity
npm ci
cp .env.example .env
npm run dev
```

Abre http://localhost:4321/restaurant-premium-sanity/. Sin projectId de Sanity el sitio funciona con `src/lib/mock.ts` y muestra un aviso de demostración. Las fotos de ejemplo usan Unsplash y necesitan conexión del navegador; los textos y carta no dependen de esa conexión. Son fotografías ambientales, no retratos de los platos o personas ficticias. Antes de un uso comercial, sustituye y verifica las licencias de todas las fotos.

Se incluye `package-lock.json`, recuperado de la instalación validada en GitHub Actions. Usa `npm ci` para reproducirla. CI conserva durante siete días el artefacto `salitre-static-review` con el HTML, lock, auditoría y capturas de revisión cuando Chrome está disponible. Las capturas no publican la web.

```bash
npm run dev           # Astro local
npm run check         # Astro/TypeScript + configuración y schemas Studio
npm test              # Contratos, demo y seguridad de URLs
npm run build         # HTML estático en dist/
npm run preview       # Build local en http://localhost:4321/restaurant-premium-sanity/
npm run studio        # Studio local en http://localhost:3333
npm run studio:build  # Compila Studio en studio-dist/ (requiere sus IDs públicos)
```

## Arquitectura

```text
src/
  components/     Header, Footer, Photo, PageIntro, ReservationCTA
  layouts/        BaseLayout: HTML, SEO, navegación y aviso demo
  pages/          index, carta, restaurante, reservas, robots.txt
  styles/         global.css: tokens, capas CSS y responsive
  lib/            content.ts, queries.ts, mock.ts
  types/          Contratos Zod y tipos inferidos
sanity/
  schemaTypes/    Objetos de imagen/SEO y documentos del restaurante
  tsconfig.json   Comprobación estricta de Studio
scripts/          Exportador NDJSON de contenido inicial
public/           Favicon
tests/           Validación de contratos y URLs
.github/workflows/validate.yml, deploy.yml
sanity.config.ts, sanity.cli.ts
```

`getContent()` obtiene una instantánea reutilizada en build. El cliente oficial ejecuta una consulta GROQ con referencias resueltas, perspectiva `published`, sin CDN y sin reintentos. Zod valida la respuesta; además se comprueba que haya exactamente una página por ruta y que cada plato tenga categoría. Los componentes reciben datos tipados y nunca conocen tokens ni SDKs. El frontend solo añade el ClientRouter y prefetch nativos de Astro para navegar; no monta React ni islas del CMS.

El modo demo solo se usa sin proyecto configurado o al activar expresamente `SANITY_ALLOW_DEMO_FALLBACK=true`. Un CMS configurado con fallos de conexión o contenido inválido **detiene la build por defecto**, conservando así la última versión publicada en un hosting con despliegues atómicos. El error no vuelca tokens ni respuesta del SDK. Con fallback se muestra un aviso visible de demo. Una categoría sin platos o galería vacía tiene un estado vacío. Los platos no disponibles se muestran identificados en carta y se excluyen de destacados.

## Configurar Sanity, paso a paso

1. Crea una cuenta y un proyecto en https://www.sanity.io/manage. Anota el **project ID**; crea un dataset `production`. Un dataset público permite leer contenido sin token; un dataset privado requiere un token de lectura.
2. Copia `.env.example` a `.env` y configura:

```dotenv
SITE_URL=https://eduardocr90.github.io
SANITY_PROJECT_ID=tu_project_id
SANITY_DATASET=production
SANITY_STUDIO_PROJECT_ID=tu_project_id
SANITY_STUDIO_DATASET=production
SANITY_ALLOW_DEMO_FALLBACK=false
```

3. Solo si el dataset es privado, añade `SANITY_API_READ_TOKEN` con permisos mínimos de lectura a `.env` y a los secretos del proveedor de build. No lo uses en Studio ni con prefijo `PUBLIC_` o `SANITY_STUDIO_`. El ID y dataset son públicos; el token no lo es.
4. Ejecuta `npx sanity login` en tu equipo y `npm run studio`. El CLI carga el `.env` de la raíz. Si Sanity lo requiere, añade `http://localhost:3333` a los orígenes CORS del proyecto con credenciales para Studio. Astro consulta en build y no necesita CORS del navegador. No uses orígenes `*` con credenciales.
5. En Studio rellena los apartados singleton **Configuración y contacto**, **Historia y chef** y **Galería editorial**. Sus IDs fijos están definidos en `sanity.config.ts`. Crea cuatro páginas con los slugs `inicio`, `carta`, `restaurante` y `reservas`, sus textos y SEO. Publica todos los documentos. No hay páginas CMS arbitrarias: las cuatro rutas tienen composiciones propias.
6. Crea categorías con nombre y orden (entrantes, principales, postres y bebidas). Crea platos, selecciona una referencia a una categoría publicada, precio en euros, descripción, alérgenos, disponibilidad y orden. Marca hasta tres platos disponibles como destacados. Publica categoría y plato. Sube imágenes y escribe un texto alternativo; Studio permite ordenar la galería.
7. Para empezar con todos los textos ficticios puedes ejecutar:

```bash
npm run seed:export
npx sanity dataset import .sanity/seed.ndjson production
```

El primer comando solo genera un archivo local ignorado por Git. **El segundo escribe en el dataset seleccionado**: úsalo en un dataset nuevo y dedicado a esta demo. No uses `--replace` en un dataset existente; los IDs coincidentes pueden generar conflictos. Se importan documentos publicados, contactos ficticios y todas las categorías/platos. Las imágenes no se importan: súbelas en Studio y asígnalas a páginas, historia, platos y galería. El sitio admite imágenes ausentes. La demo local conserva sus fotos de Unsplash.

8. Ejecuta `npm run build` y `npm run preview`. El aviso de fuente demo desaparece al consumir CMS válido; la indicación de restaurante ficticio y `noindex` se mantienen mientras `isFictional` sea verdadero. Para probar cambios en desarrollo, reinicia Astro tras publicar: la instantánea está cacheada en el proceso. En producción hace falta una nueva build; publicar en Sanity no cambia HTML ya generado.

## SEO, imágenes y reservas

Metadatos por página, canonical con `SITE_URL`, Open Graph, Twitter card, idioma español y robots.txt. El dominio .example, la demo y el restaurante ficticio incluyen `noindex, follow`. No se añaden datos estructurados de un negocio real a este ejemplo. Antes de publicar, sustituye dominio, identidad y contactos; revisa toda la información y desactiva `isFictional` solo cuando represente un negocio real.

`Photo.astro` genera srcsets con tamaños 480–2400 para Unsplash y el CDN de Sanity, usa `auto=format`, dimensiones HTML, lazy loading y prioridad alta para la imagen principal. Los assets originales de Sanity se sirven desde su CDN; no se descargan durante la build. Hay espacios reservados para las imágenes, estilos responsive, foco visible, salto al contenido y `prefers-reduced-motion`. La serif usa Georgia y fuentes del sistema: sin descargas externas de fuentes. El hotspot puede editarse en Studio pero esta versión usa recorte centrado CSS, no coordenadas de hotspot.

El botón de reservas solo aparece con fuente Sanity, `isFictional=false` y una URL HTTPS de proveedor real. El enlace abre el proveedor; no procesa pagos ni guarda datos. Sin proveedor hay un mensaje explícito, sin formulario falso. Los datos de contacto demo no generan enlaces de teléfono ni correo.

## Webhooks y futura publicación

La demo se prepara para GitHub Pages mediante el workflow descrito abajo. No se configura SiteGround.

1. Cuando elijas un hosting de builds estáticas, configura `npm run build`, salida `dist/`, Node 22 y variables de entorno en su gestor de secretos.
2. Crea un deploy hook en ese proveedor y conserva su URL como secreto; no la incluyas en el repositorio ni en el frontend.
3. En Sanity Manage → API → Webhooks, crea un webhook para el dataset `production`, método POST, URL del deploy hook y eventos create/update/delete. Usa el filtro `!(_id in path("drafts.**")) && _type in ["settings", "page", "category", "dish", "story", "gallery", "sanity.imageAsset"]`.
4. Si usas un endpoint propio, configura un secreto y verifica la firma de Sanity antes de disparar la build. Para hooks del proveedor sigue su mecanismo de autenticación; no afirmes validar firmas si el hook no lo permite.
5. Publica un cambio de prueba y verifica tanto la entrega del webhook como la build y el nuevo HTML. Este circuito queda preparado documentalmente, **no probado ni configurado en un proveedor**.

## Validación y CI

GitHub Actions valida PRs y pushes a main: instalación, Astro/TypeScript, tests, build demo y compilación de Studio con un ID de ejemplo (sin conexiones reales). No despliega. También exporta la semilla y adjunta un informe `npm audit`; sus avisos deben revisarse antes de producción. El pipeline no acredita la conexión a un CMS real.

Pendiente en un equipo con acceso npm: instalar con npm ci y repetir los comandos si se modifica el código; inspeccionar las cuatro páginas a 375, 768 y 1440 px; probar teclado, contraste y reducción de movimiento; Lighthouse/Core Web Vitals; probar dataset público/privado, errores de contenido y webhook con un proyecto Sanity real. No se atribuyen resultados ni métricas que no se han medido.

## Demo en GitHub Pages

URL objetivo: https://eduardocr90.github.io/restaurant-premium-sanity/ . La presencia del workflow no acredita una publicación: comprueba que el job `deploy` termine correctamente y abre la URL pública.

Configuración de Astro: salida estática, `site: https://eduardocr90.github.io`, `base: /restaurant-premium-sanity` y barra final en las rutas. `src/lib/paths.ts` aplica `import.meta.env.BASE_URL` a enlaces internos y favicon; Astro aplica la base al CSS compilado. Las fotos HTTPS de Unsplash/Sanity y las fuentes del sistema conservan sus ubicaciones. Los canonical y Open Graph incluyen la ruta base. La demo mantiene noindex y las reservas inactivas.

`.github/workflows/deploy.yml` sigue las guías oficiales de [Astro](https://docs.astro.build/en/guides/deploy/github/) y [GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): `withastro/action@v6` instala, comprueba, genera y sube el artefacto; `actions/deploy-pages@v5` publica únicamente desde main con permisos Pages/OIDC y el entorno github-pages. La acción oficial detecta package-lock.json. No se proporcionan variables ni secretos Sanity al workflow demo, por lo que usa los datos de ejemplo. La integración CMS sigue disponible en desarrollo y futuras builds configuradas.

Configuración manual en GitHub:

1. Integra la PR que contiene el proyecto y este workflow en main cuando esté aprobada.
2. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**. No selecciones una rama de publicación ni añadas un CNAME.
3. Si el repositorio es privado, comprueba que tu plan permita Pages en repositorios privados. No se cambia la visibilidad del repositorio automáticamente.
4. Comprueba que Actions permita las acciones oficiales y que el entorno `github-pages` permita desplegar desde main. Si tiene revisores obligatorios, aprueba el despliegue en GitHub.
5. La integración en main inicia el workflow. Si has activado Pages después, ejecuta **Actions → Deploy demo to GitHub Pages → Run workflow → main**, o reejecuta el job fallido de despliegue.
6. Comprueba el resultado de `deploy`, abre la URL y navega a carta, restaurante y reservas desde el móvil. Las fotografías remotas requieren acceso a sus CDN.

Sin tocar credenciales, puedes reproducir la build con `npm ci`, `npm run build`, `npm run check:build` y `npm run preview`. La comprobación de build verifica rutas, recursos locales, anclas, navegación activa y canonical de las cuatro páginas bajo la base. CI sirve las capturas bajo la misma subruta y limita cada ejecución de Chrome a 30 segundos.

Para mover el proyecto en el futuro a un dominio sin subcarpeta, cambia site/base en astro.config.mjs y actualiza la comprobación de build; no elimines manualmente los prefijos de cada componente.

## Navegación y vista previa al compartir

El layout compartido monta `ClientRouter` de `astro:transitions`. El root y la cabecera no se animan; solo el contenido usa `fade({ duration: '300ms' })`, también al recorrer el historial. La cabecera se reemplaza con el HTML actualizado sin animación para conservar `aria-current` correcto: no se persiste un menú con estado obsoleto. El menú móvil continúa siendo una fila de enlaces nativos, sin scripts de apertura/cierre. No se requieren listeners de `astro:page-load` de producto; si se añaden nuevas interacciones, inicialízalas en ese evento evitando duplicar listeners.

Prefetch es opt-in en navegación y CTA: `prefetchAll: false`, estrategia hover/foco y atributo data-astro-prefetch. No se precargan todas las páginas al entrar ni enlaces externos/anclas; Astro cambia a tap con ahorro de datos o conexión lenta. No se ignora la detección de red. El router mantiene sus anuncios accesibles y respeta movimiento reducido, con una regla adicional para los pseudoelementos de View Transitions. Sin JS sigue disponible la navegación HTML; sin la API nativa se usa el fallback de Astro.

El head ordena charset, viewport, título/descripción/canonical, robots/presentación, Open Graph/Twitter y recursos/router. Los metadatos se generan en HTML estático y se actualizan durante las transiciones. La imagen por defecto `public/og-default.jpg` es un JPEG progresivo 1200×630 (aprox. 146 KiB), servido desde la base de GitHub Pages con URL HTTPS absoluta, tipo, dimensiones y texto alternativo. Se usa la misma fotografía de demostración del hero de Unsplash, identificador photo-1414235077428-338989a2e8c0. El campo SEO de imagen de Sanity tiene prioridad cuando está configurado y publicado; no se inventan sus dimensiones.

Las redes pueden cachear una vista previa anterior: tras desplegar, solicita una nueva lectura en el inspector de compartir de la plataforma correspondiente. Que los metadatos y la imagen respondan correctamente no acredita el resultado de todas las apps de mensajería.

`node scripts/check-navigation.mjs` prueba las cuatro páginas en Chromium, historial, CTA, anclas, cabecera estable, metadatos, imágenes, errores JS, fallback sin View Transitions, movimiento reducido, ahorro de datos y navegación sin JS. CI instala Playwright temporalmente fuera del proyecto y usa Chrome ya instalado; no se añade ninguna dependencia al producto o al lockfile. Para reproducirlo: instala playwright@1.56.1 en un directorio temporal, ejecuta npm run build y npm run preview y define PLAYWRIGHT_MODULE con la URL file:// de su index.mjs; CHROME_BIN permite seleccionar el ejecutable. TEST_ORIGIN permite ejecutar el mismo recorrido contra un servidor publicado.
