# Fase 1: modelo reutilizable y páginas por bloques

## Diagnóstico previo y alcance

La revisión de ambos repositorios se realizó antes de cambiar código. El frontend de partida es Astro estático + TypeScript estricto, con una instantánea GROQ validada mediante Zod. Las consultas ya estaban fuera de los componentes, pero el contrato `page.slug` admitía únicamente cuatro valores; la navegación y las composiciones vivían en cuatro archivos de ruta. Studio tiene ocho tipos originales y es la única fuente de verdad de sus esquemas.

La lectura inicial de `hfa8zkyw/production` el 30 de octubre de 2026 confirmó **22 documentos publicados, cuatro páginas y once platos**. Pasaron los seis tests originales, la build real y `check:build`. La documentación anterior sobre el dataset vacío era histórica. El propietario confirma que el webhook ya funciona; esta sesión no ha publicado contenido ni provocado un despliegue para volver a comprobar su entrega.

Riesgos identificados: defaults ausentes en documentos antiguos, valores `null` de GROQ, rutas duplicadas o reservadas, diferencias entre oculto y agotado, enlaces a páginas ocultas y pérdida de la base de Pages. La transición es aditiva, sin modificar documentos, IDs, referencias, fotografías ni workflows de despliegue.

## Capas y repositorios

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Modelo común | `src/types/content.ts`, `blocks.ts`, `restaurant.ts`, `routes.ts` | Contratos Zod y tipos inferidos, sin dependencias del CMS |
| Acceso y adaptación | `src/lib/sanity.server.ts`, `queries.ts`, `content.ts`, `published-content.ts` | Configuración privada, consulta publicada, resolución de assets/referencias y validación |
| Servicios puros | `src/lib/pages.ts`, `blocks.ts`, `rich-text.ts`, `format.ts` | Páginas, navegación, carta, bloques y formato; no consultan el SDK |
| Presentación | `src/components/`, `src/layouts/` | Props tipadas; sin GROQ, SDK ni tokens |
| Generación | `src/pages/[...slug].astro` | `getStaticPaths`, una ruta por página pública |
| Modelo editorial | Repositorio `studio-salitre-restaurant/schemaTypes/` | Esquemas originales y nuevos objetos |

Astro sigue con `output: static`. `getContent()` reutiliza una instantánea por build. No se añaden React, SSR, nuevas dependencias de producto ni scripts de cliente. Se conservan ClientRouter, prefetch selectivo y movimiento reducido.

Las composiciones originales se extraen a `HomePage`, `MenuPage`, `StoryPage` y `ContactPage`. `MenuSection` se comparte con los bloques. Las rutas no ejecutan consultas al SDK. Imágenes y referencias Sanity se convierten en `{url, alt}` e identificadores antes de llegar a los componentes.

## Compatibilidad sin migración obligatoria

Los tipos originales `settings`, `page`, `category`, `dish`, `story`, `gallery`, `editorialImage` y `seo` conservan sus nombres y campos. Los singletons siguen siendo `restaurant-settings`, `restaurant-story` y `restaurant-gallery`.

Los documentos anteriores no necesitan escrituras de migración:

- Sin `status`: página pública; los borradores se excluyen mediante la perspectiva `published`.
- Sin navegación explícita: Inicio, La carta, La casa y Reservas, con el orden anterior.
- Sin bloques o con lista vacía en una ruta original: composición anterior completa.
- Sin `visible` en categorías/platos: visibles. `available=false` sigue mostrando el plato agotado.
- Sin tema: mismos colores, fuentes y apariencia de Salitre.
- Sin preferencias de módulos: lista vacía, sin funcionalidades concedidas.

Los defaults son repetibles y no mutan el dataset: ejecutar builds varias veces no escribe nada. No se necesita ejecutar un script de migración. El exportador de semilla continúa funcionando y **no debe importarse sobre los 22 documentos existentes**.

### Convertir una composición existente de forma gradual

1. Conserva una exportación y registra los IDs/revisiones antes de una futura migración autorizada. Desde Studio, con tus permisos y sin compartir tokens: `npx sanity dataset export production ../work/salitre-backup.tar.gz`.
2. Trabaja primero en otro dataset/proyecto y en una rama de frontend/Studio. No actives su webhook contra producción.
3. Inventaría textos, CTA, imágenes, platos destacados, historia, chef, galería y contacto de la página y sus singletons compartidos.
4. Crea una página nueva de revisión y reproduce cada sección con bloques. Para portada: hero, texto de concepto, tarjetas/platos, imagen y texto de historia y CTA. Para restaurante: texto, imagen y texto de chef y galería. Para carta: sección de carta. El contacto conserva su composición mientras no exista un bloque específico que represente todos sus horarios y avisos.
5. Compara contenido, imágenes, enlaces, responsive y accesibilidad. **Añadir el primer bloque sustituye visualmente toda la composición anterior**; no añade contenido debajo de ella.
6. Publica el cambio de una página solo después de revisar la equivalencia. No borres campos antiguos ni singletons. Retirar los bloques restaura la composición anterior.

Esta fase no convierte automáticamente las páginas reales a bloques ni hace una migración parcial que pierda contenido. Una futura migración masiva deberá usar parches condicionados por `_rev`, rellenar solo campos ausentes y mantener un registro para rollback; requiere revisión y autorización separadas.

## Páginas y navegación

Una página tiene título, slug, `status`, `seo`, `noindex`, `navigationLabel`, `navigationOrder`, `showInNavigation` y bloques ordenados. Antetítulo, introducción e imagen siguen disponibles para compatibilidad.

- Slug: 1–80 caracteres; letras ASCII minúsculas, números y guiones simples. No se admiten barras, espacios, acentos ni rutas anidadas en esta fase.
- Reservados: `index`, `404`, `admin`, `dashboard`, `api`, `assets`, `_astro`, `robots`, `robots.txt`, `sitemap`, `sitemap.xml`.
- Studio valida formato y utiliza la unicidad nativa de slug; el frontend vuelve a rechazar duplicados y colisiones antes de generar HTML.
- `inicio` corresponde a `/`; los otros slugs corresponden a `/<slug>/`.
- Se mantienen los cuatro documentos lógicos originales como requisito de compatibilidad. No cambies sus slugs. Sí puedes ocultarlos: dejan de generar ruta y se retiran sus enlaces automáticos.
- Una página oculta no aparece en rutas, navegación ni sitemap. Una página sin visibilidad de menú conserva su ruta pública.
- Una página `noindex` conserva su ruta, lleva robots noindex y se excluye del sitemap.
- La navegación usa el orden del CMS. Empates conservan el orden estable de la instantánea.
- Los enlaces manuales de bloques deben apuntar a destinos existentes. `check:build` detecta enlaces internos rotos; al ocultar páginas revisa también esos enlaces editoriales.

La 404 está en `dist/404.html`, incluye navegación y noindex. GitHub Pages se encarga de servirla ante rutas inexistentes. No hay pantalla de error de CMS: un fallo o contenido global inválido detiene la nueva build y conserva el despliegue anterior. El fallback demo sigue siendo explícito.

### Crear una página desde Studio

1. Abre **Páginas y navegación → Crear Página**.
2. Escribe un título y slug, por ejemplo `eventos`. Completa SEO; antetítulo e introducción son opcionales.
3. Elige visibilidad pública, presencia/etiqueta/orden en el menú y opciones de indexación.
4. Añade bloques y arrástralos para ordenar. Rellena los campos obligatorios y alt de imágenes.
5. Revisa y publica. El webhook existente reconstruye Astro; el HTML no cambia hasta terminar el despliegue.

No hay que crear un archivo Astro por página. Para revisar localmente: `npm run build && npm run check:build && npm run preview`.

## Catálogo de bloques

Todos son objetos embebidos en `page.blocks`, con `_key` de Sanity y orden de array. Admiten título cuando corresponde y variantes editoriales ampliables. Se normalizan y validan antes de renderizar; tipos desconocidos o bloques inválidos se omiten individualmente y avisan durante desarrollo, sin exponer datos privados.

| Tipo Sanity/TypeScript | Componente | Campos específicos |
| --- | --- | --- |
| `hero` | `HeroBlock` | título obligatorio, subtítulo, imagen, CTA, alineación |
| `richText` | `TextBlock` | Portable Text, ancho lectura/amplio, alineación |
| `imageText` | `ImageTextBlock` | imagen y texto obligatorios, posición, CTA |
| `galleryBlock` | `GalleryBlock` | imágenes ordenables con alt |
| `menuSection` | `MenuBlock` / `MenuSection` | referencias a categorías/platos; vacío selecciona todos |
| `cards` | `CardsBlock` | tarjetas ordenables con título, descripción, imagen y enlace |
| `cta` | `CTABlock` | título y enlace obligatorios; descripción e imagen opcionales |
| `faq` | `FAQBlock` | preguntas/respuestas ordenables, HTML `details/summary` |
| `divider` | `DividerBlock` | espacio pequeño/medio/grande y línea opcional |
| `notice` | `NoticeBlock` | texto, CTA, inicio/fin opcionales |

El registro central está en `src/components/blocks/registry.ts` y exige una entrada por tipo de contrato. `resolveBlocks` conserva el orden y evita que un componente reciba un bloque no validado. La selección dinámica de componente se hace únicamente tras validar el discriminante `_type`.

La página aporta el único h1. Los heroes de bloque usan h2. El texto enriquecido admite párrafos, h2, h3, citas, listas, negrita, cursiva y enlaces; se escapa el texto, sin HTML arbitrario. Las listas anidadas del editor se aplanan a listas semánticas de un nivel en esta primera versión.

Las referencias de carta se adaptan a `categoryIds`/`dishIds`; los componentes no conocen `_ref` ni assets. Ocultar una categoría también oculta sus platos. Agotado se muestra con aviso; oculto se omite, incluso en destacados.

Las fechas de avisos se evalúan **en build**: inicio inclusivo y fin exclusivo. No cambian el HTML por sí solas. Reconstruye al inicio/fin si necesitas exactitud; no se ha programado ninguna automatización.

### Añadir otro bloque

1. Declara el objeto con validaciones, defaults y preview en `studio-salitre-restaurant/schemaTypes/blocks.ts`; añádelo a `blockNames` y `blockTypes`.
2. Añade su esquema discriminado a `src/types/blocks.ts`; los tipos `ContentBlock` y `BlockOf` se derivan de él.
3. Si usa referencias o assets nuevos, adapta `src/lib/queries.ts` sin introducir GROQ en componentes.
4. Crea su componente tipado con `BlockOf<'nuevoTipo'>` y regístralo en `registry.ts`.
5. Añade ejemplos y pruebas: opcionales, inválidos, orden y HTML generado. Actualiza este catálogo.
6. Ejecuta check/tests/build en los dos repositorios y prueba con el contenido real sin escribirlo.

## Experiencia editorial y carta

Studio agrupa **Mi restaurante**, **Páginas y navegación**, **Carta y categorías**, **Galerías e imágenes**, **Promociones y avisos** y **Configuración**. La sección de promociones muestra páginas que contienen avisos; no crea documentos de promoción duplicados.

Platos conservan referencias a categorías, imágenes, precios y alérgenos existentes. Se añaden visible y etiquetas. La previsualización distingue oculto, visible agotado y disponible. Categorías y platos pueden ordenarse por el campo numérico Orden y desde las listas con la ordenación correspondiente. Los bloques, imágenes, tarjetas y preguntas se reordenan arrastrando. No se añade un plugin de drag-and-drop para documentos de carta.

Asocia un plato desde su campo Categoría; publícala antes que el plato. Los alérgenos siguen siendo texto compatible con los valores existentes, con valores únicos y no vacíos; no se infiere seguridad alimentaria a partir de una lista vacía. Se mantienen las advertencias sobre trazas.

La vista previa sigue siendo la build local o la última web publicada. No se introduce infraestructura de borradores ni editor visual.

## Identidad visual y otro restaurante

`settings` incorpora `logo`, `theme` y preferencias futuras de módulos. `theme` permite nombre de tema, fondo/texto/acento hexadecimal, tipografía editorial/sans, botones rellenos/contorno y tarjetas editoriales/compactas. Los valores llegan a variables CSS validadas y atributos de presentación. Cambiar colores requiere revisar contraste; no hay garantía automática para combinaciones arbitrarias.

Solo se implementa el tema Salitre como base. Para un tema nuevo, amplía el contrato y las opciones editoriales y añade estilos/componentes de presentación; reutiliza el modelo y los adaptadores. Las composiciones originales contienen textos decorativos y coordenadas de Salitre; un restaurante diferente debe personalizarlas o usar páginas por bloques.

Para una segunda web:

1. Crea un **proyecto Sanity independiente** y su dataset. Usa los mismos esquemas del repositorio Studio, sin copiar el contenido de producción de Salitre.
2. Reutiliza el frontend en un repositorio propio. Configura `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SITE_URL` y `SITE_BASE` (por ejemplo `/otro-restaurante` o `/`).
3. Configura Studio con `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` y hostname propio. Su workflow actual fija Salitre: adapta sus identificadores antes de publicarlo para otro restaurante.
4. Usa credenciales propias por restaurante y permisos mínimos. Un token de lectura va solo al entorno de build, nunca a `PUBLIC_*`, `SANITY_STUDIO_*`, Git o el navegador.
5. Crea los singletons con los mismos IDs **dentro de ese proyecto independiente**, las cuatro páginas lógicas, categorías, platos e imágenes. Configura identidad, contacto, tema y SEO propios.
6. Los CTAs/contacto/reservas solo deben representar datos reales después de desactivar `isFictional`. El enlace HTTPS a proveedor externo conserva sus protecciones actuales.
7. Configura su webhook hacia su propio repositorio. Para Actions adapta también `SITE_URL` y, si procede, pasa `SITE_BASE` al job; los defaults de los workflows existentes conservan Salitre.
8. Ejecuta `SITE_BASE=/otra-base npm run build` y el mismo `SITE_BASE=/otra-base npm run check:build`. Las pruebas de navegador actuales usan la base de Salitre; adáptalas al validar un clon.

## Capacidades y futura fase 2

Preferencias CMS: `{key, enabled, presentation}` para reservas, empleados, QR, eventos y analíticas. No ejecutan funcionalidades. El contrato separado `ModuleEntitlement` representa autorización externa; `canUseModule` devuelve falso sin un entitlement autorizado para ese mismo módulo. El CMS no puede emitirlo y actualmente no se obtiene de ningún backend.

Para fase 2: definir identidad de restaurante y usuarios en backend, permisos y contratación verificables por servidor, auditoría y sincronización editorial. Mantener los adaptadores de esta fase como frontera de lectura. Después diseñar un módulo concreto y sus contratos. No se han añadido dashboard, login, reservas internas, turnos, facturación, suscripciones, Supabase ni altas automáticas.

## SEO, rendimiento y despliegue

Se mantienen canonical, metadatos sociales, `Photo` con tamaños responsivos, dimensiones, lazy loading y prioridades. Se añade sitemap de páginas públicas indexables y enlace desde robots.txt; demo/ficticio mantiene noindex y sitemap vacío. Se añade JSON-LD Restaurant mínimo para contenido comercial validado, con texto escapado. La 404 siempre lleva noindex.

El workflow de Pages y su entrada `workflow_dispatch` con `source: sanity` se conservan. El filtro actual incluye `page`, `settings`, `category`, `dish`, `story`, `gallery` y assets: cubre bloques embebidos, tema y preferencias, **sin cambiar el webhook**. No hay nuevos tipos documentales que añadir a ese filtro.

Orden de entrega recomendado: revisar ambas PR, integrar primero el frontend compatible y después publicar Studio/schema cuando se autorice. No hace falta tocar producción para la transición. La integración del frontend en main activa el workflow de Pages existente: debe hacerse solo al autorizar el despliegue. Este trabajo no realiza merge, publicación de Studio ni despliegue.

## Validación reproducible y límites

```bash
# Frontend: Node >=22.22, dependencias del lock
npm ci --no-audit --no-fund
npm run check
npm test
npm run build
npm run check:build
npm run check:cms
npm run seed:export  # solo genera un archivo local; NO importar en producción

# Studio, en su repositorio
npm ci --no-audit --no-fund
npm run check
npm test
npm run build
```

No existe script lint en ninguno de los dos proyectos; no se declara un lint ejecutado. `check` usa Astro/TypeScript o tsc. Los tests de frontend incluyen builds aisladas con fixtures, sin credenciales, para rutas CMS, los diez bloques, campos opcionales, orden, tipos desconocidos, ocultos, agotados, enlaces seguros, SEO comercial, IDs repetidos y bases `/restaurant-premium-sanity` y `/`. Esas builds simuladas no equivalen a publicar documentos en Sanity.

La comprobación real de Sanity, las pruebas de navegador y la comparación de la versión previa están recogidas en `VALIDATION.md`. No se han medido Lighthouse/Core Web Vitals ni probado con lector de pantalla. Queda una revisión editorial en Studio y publicar una página real de prueba en un dataset de ensayo después de aprobar las PR. El webhook se conserva, pero su entrega no se ha vuelto a disparar durante esta sesión.
