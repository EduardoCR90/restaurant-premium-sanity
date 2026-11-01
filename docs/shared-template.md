# Fase 5 · Iteración 1 — Template compartido

Salitre consume `@restaurant-platform/astro-template` 0.3.0. Su fuente es el repositorio privado [restaurant-astro-template](https://github.com/EduardoCR90/restaurant-astro-template). No se reescribe la web ni se migran documentos.

## Separación

- `vendor/restaurant-template`: distribución generada del paquete común. Componentes, layouts, bloques, contratos, estilos, acceso Sanity de lectura y evidencia/reportes de publicación. No editar a mano.
- `restaurant.config.ts`: identidad de esta instancia, proyecto/dataset, site/base, tokens visuales, assets de SEO y endpoint de informes. Ningún valor es una credencial.
- `src/instance/editorial-defaults.ts`: textos históricos exclusivos de Salitre para documentos anteriores. El CMS mantiene prioridad; links null se ocultan y headings son atómicos.
- `src/lib/mock.ts` y `public/`: datos e imágenes de demostración de esta instancia.
- `src/lib/content.ts`: conecta el loader compartido con el contenido/configuración de Salitre y la evidencia OIDC existente.
- Las fachadas de una línea de `src/lib`/`src/types` conservan rutas de importación de herramientas anteriores; no duplican modelos.

El contrato del CMS y los IDs singleton no cambian. Los schemas siguen únicamente en Studio. El dashboard y Supabase no se modifican en esta iteración. Los campos de configuración nuevos preparan tipografías, espaciados, anchos, botones y variantes; no se introduce un constructor visual ni aprovisionamiento.

## Versión y actualizaciones

`package.json` usa `file:vendor/restaurant-template`; `template.lock.json` identifica versión, commit inmutable, repositorio y SHA-256 de cada archivo distribuido. CI y el workflow de publicación ejecutan `npm run template:verify`. Compilar no requiere acceso al repositorio privado ni otro token.

La distribución hereda la visibilidad de este repositorio; un upstream privado no oculta el código distribuido aquí. No incluye secretos, contenido privado ni exportaciones reales.

Para actualizar de forma controlada:

1. Revisar la release y CI del template. Clonar con acceso autorizado y hacer checkout del tag, por ejemplo `v0.3.0`.
2. Desde esta instancia: `node scripts/template-distribution.mjs sync /ruta/restaurant-astro-template v0.3.0`. Se comprueba origen, commit/tag, limpieza del código fuente e integridad de la distribución actual. Si alguien ha editado vendor, se detiene sin sobrescribir esos cambios.
3. Ejecutar `npm install --package-lock-only --ignore-scripts`, `npm ci`, `npm run template:verify`, `npm run check`, `npm test`, `npm run build` y `npm run check:build`.
4. Revisar navegación/fotos/SEO y las composiciones históricas; integrar la PR solo con CI aprobada.

No se sigue main automáticamente. Parches y versiones menores deben ser compatibles; rupturas requieren versión mayor y notas de migración. Configuración y overrides locales quedan fuera de vendor. Revertir la PR de actualización recupera la versión anterior.

## Comportamiento conservado

Las cuatro rutas, categorías/platos dinámicos, precios, fotografías, identidad visual, textos, CTA, SEO/Open Graph, navegación nativa, prefetch, transiciones, accesibilidad y reducción de movimiento. Las páginas sin bloques siguen usando sus composiciones históricas. Las páginas con bloques conservan orden/datos/variantes del CMS.

Se mantienen Sanity → workflow_dispatch → Astro → GitHub Pages y los reportes OIDC. El algoritmo de huellas y la identidad de run/intento/SHA no cambian. No se añade otro disparador ni se introducen secretos. Las variables privadas se leen por nombre en el servidor; no se utiliza PUBLIC_ para suplir configuración.

## Validación

Los tests existentes comparan estructura y texto del HTML con las composiciones originales; además prueban los diez bloques, etiquetas y categorías, ocultación, SEO social, referencias y el algoritmo de publicación. El template prueba configuración, aislamiento, builds con otras identidades/URLs/bases, render genérico, GROQ en memoria y protección de la distribución ante modificaciones.

La siguiente iteración añadirá variantes y composición configurable más rica. No se han creado Burger House ni recursos de nuevos restaurantes.

La comparación local contra la versión anterior 7dd776b verificó geometría, colores y tipografías en las cuatro rutas a 390 y 1440 px (imágenes sintéticas para aislar la red). Las fotos originales y las transiciones se comprueban además en el recorrido de navegador existente.

## Variantes y compatibilidad de Salitre

La versión 0.3.0 añade presets Elegant, Modern y Casual, tokens de color/fuentes/espaciado/botones y variantes para hero, carta, destacados, galería, CTA, cabecera y footer. Sin preset, la configuración local y los campos CMS anteriores mantienen su prioridad y aspecto. No se modifica ningún documento durante la actualización.

El dashboard puede gestionar visibilidad de bloques y secciones históricas sin convertir las cuatro páginas a un sistema nuevo. Guardar/publicar conserva el seguimiento OIDC y la reconstrucción existente. No se añade un segundo webhook ni migración.

CI construye también el commit pre-variantes `23f9a2332d8d0dc49598abf80865a395bda32c17` con demo y ejecuta `scripts/check-visual.mjs`: ocho comparaciones (cuatro rutas × móvil/escritorio) de geometría, tipografía, color y PNG exacto. Las fotos se sustituyen solo en el navegador de prueba por SVG sintético; no se consulta ni escribe contenido privado. Para reproducir con ambas builds, definir `VISUAL_BASELINE_DIR`, `PLAYWRIGHT_MODULE` y `CHROME_BIN` y ejecutar el script. Las capturas se guardan en `review/`.

## Consolidación y actualizaciones validadas

`template.instance.json` fija los contratos de configuración 1, contenido salitre-v1 y visual 2. `template:verify` comprueba también la compatibilidad de la instancia; la release y cada archivo están protegidos por el lock.

El actualizador reutilizable de la fuente privada (`tools/update-instance.mjs`) prepara un worktree aislado y ejecuta instalación sin hooks, verificación, tipos, tests, build y comprobación de rutas antes de aplicar vendor/locks al checkout limpio. Un fallo deja intacta la rama. `template.update.json` registra el salto 0.2.0 → 0.3.0 validado, sin afirmar despliegue. No editar vendor ni sustituir la validación por el recibo.

El workflow existente incorpora la identidad íntegra del template en la misma evidencia de revisiones y en los informes ready/succeeded OIDC. Supabase registra la versión instalada solo si ambos corresponden al mismo run/intento/commit y a una release aprobada. Se conservan el webhook y los callbacks existentes, sin un segundo dispatch. La versión seleccionada desde Super Admin es una solicitud independiente de la instalada.

El cliente gestiona contenidos, orden y visibilidad; el diseño global, branding y variantes corresponden a Super Admin mediante el backend. Esta actualización no modifica documentos de Sanity ni configuración visual de Salitre, DNS o dominio. La fase 6 ejecutará el aprovisionamiento; los contratos de restaurante/template/visuales/módulos/dominio ya están tipados en el template compartido.
