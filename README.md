# Salitre — Restaurante Premium

Web editorial para un restaurante **ficticio** en Tenerife. Astro estático, TypeScript estricto y Sanity Studio independiente. Cuatro páginas, once propuestas de carta y una composición en marfil, carbón y terracota. No hay reservas activas ni backend de reservas.

## Estado de esta entrega

Implementación fuente completa. El entorno no pudo conectar con el proxy al consultar GitHub/npm y no tiene las dependencias en caché. La primera ejecución de GitHub Actions ha superado Astro/TypeScript (0 errores y avisos), tres tests, build estática de las cuatro páginas y compilación de Studio. Las revisiones posteriores vuelven a pasar por CI. No hay credenciales de Sanity; **la conexión a un dataset real no se ha probado**. No se ha desplegado el proyecto. Consulta `VALIDATION.md` para los resultados verificables y las comprobaciones pendientes.

## Instalación desde otro ordenador

Requiere Node.js 22.12+ (recomendado Node 22 LTS) y npm.

```bash
git clone https://github.com/EduardoCR90/restaurant-premium-sanity.git
cd restaurant-premium-sanity
# Cambia a la rama de la implementación si todavía no se ha integrado en main.
npm install
cp .env.example .env
npm run dev
```

Abre http://localhost:4321. Sin projectId de Sanity el sitio funciona con `src/lib/mock.ts` y muestra un aviso de demostración. Las fotos de ejemplo usan Unsplash y necesitan conexión del navegador; los textos y carta no dependen de esa conexión. Son fotografías ambientales, no retratos de los platos o personas ficticias. Antes de un uso comercial, sustituye y verifica las licencias de todas las fotos.

La build de CI publica un artefacto `salitre-static-review` con el HTML generado, el lock resuelto y el informe de auditoría. No se incluye todavía `package-lock.json` en Git porque las dependencias no se han podido resolver localmente. Tras la primera instalación correcta, guarda el lock en Git, usa `npm ci` en CI y activa la caché npm de setup-node. Las versiones declaradas admiten parches y versiones menores compatibles.

```bash
npm run dev           # Astro local
npm run check         # Astro/TypeScript + configuración y schemas Studio
npm test              # Contratos, demo y seguridad de URLs
npm run build         # HTML estático en dist/
npm run preview       # Build local en http://localhost:4321
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
.github/workflows/validate.yml
sanity.config.ts, sanity.cli.ts
```

`getContent()` obtiene una instantánea reutilizada en build. El cliente oficial ejecuta una consulta GROQ con referencias resueltas, perspectiva `published`, sin CDN y sin reintentos. Zod valida la respuesta; además se comprueba que haya exactamente una página por ruta y que cada plato tenga categoría. Los componentes reciben datos tipados y nunca conocen tokens ni SDKs. No hay JavaScript enviado al navegador por la aplicación.

El modo demo solo se usa sin proyecto configurado o al activar expresamente `SANITY_ALLOW_DEMO_FALLBACK=true`. Un CMS configurado con fallos de conexión o contenido inválido **detiene la build por defecto**, conservando así la última versión publicada en un hosting con despliegues atómicos. El error no vuelca tokens ni respuesta del SDK. Con fallback se muestra un aviso visible de demo. Una categoría sin platos o galería vacía tiene un estado vacío. Los platos no disponibles se muestran identificados en carta y se excluyen de destacados.

## Configurar Sanity, paso a paso

1. Crea una cuenta y un proyecto en https://www.sanity.io/manage. Anota el **project ID**; crea un dataset `production`. Un dataset público permite leer contenido sin token; un dataset privado requiere un token de lectura.
2. Copia `.env.example` a `.env` y configura:

```dotenv
SITE_URL=https://tu-dominio-real.com
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

No se configura SiteGround ni se publica nada en esta fase.

1. Cuando elijas un hosting de builds estáticas, configura `npm run build`, salida `dist/`, Node 22 y variables de entorno en su gestor de secretos.
2. Crea un deploy hook en ese proveedor y conserva su URL como secreto; no la incluyas en el repositorio ni en el frontend.
3. En Sanity Manage → API → Webhooks, crea un webhook para el dataset `production`, método POST, URL del deploy hook y eventos create/update/delete. Usa el filtro `!(_id in path("drafts.**")) && _type in ["settings", "page", "category", "dish", "story", "gallery", "sanity.imageAsset"]`.
4. Si usas un endpoint propio, configura un secreto y verifica la firma de Sanity antes de disparar la build. Para hooks del proveedor sigue su mecanismo de autenticación; no afirmes validar firmas si el hook no lo permite.
5. Publica un cambio de prueba y verifica tanto la entrega del webhook como la build y el nuevo HTML. Este circuito queda preparado documentalmente, **no probado ni configurado en un proveedor**.

## Validación y CI

GitHub Actions valida PRs y pushes a main: instalación, Astro/TypeScript, tests, build demo y compilación de Studio con un ID de ejemplo (sin conexiones reales). No despliega. También exporta la semilla y adjunta un informe `npm audit`; sus avisos deben revisarse antes de producción. El pipeline no acredita la conexión a un CMS real.

Pendiente en un equipo con acceso npm: instalar dependencias y generar lock; ejecutar todos los comandos; inspeccionar las cuatro páginas a 375, 768 y 1440 px; probar teclado, contraste y reducción de movimiento; Lighthouse/Core Web Vitals; probar dataset público/privado, errores de contenido y webhook con un proyecto Sanity real. No se atribuyen resultados ni métricas que no se han medido.
