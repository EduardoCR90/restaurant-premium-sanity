# Convenciones de Salitre

- Lee README.md antes de modificar el proyecto. Mantén Astro estático y TypeScript estricto.
- Componentes visuales en src/components; datos y consultas solo en src/lib; contratos en src/types; esquemas únicamente en EduardoCR90/studio-salitre-restaurant/schemaTypes. Las páginas no consultan directamente al SDK.
- Idioma del sitio y contenido de ejemplo: español. Mantén avisos de restaurante ficticio y noindex en demo.
- Dirección de arte: marfil, carbón, terracota, serif editorial, espacio negativo, composiciones asimétricas. Evita cards genéricas, sombras y degradados.
- Mobile first, HTML semántico, un h1 por página, navegación por teclado, foco visible, imágenes con alt y dimensiones, soporte de movimiento reducido. No añadas JS del cliente sin necesidad.
- Nunca añadas credenciales, archivos .env ni tokens a Git. No uses variables PUBLIC_ para secretos. Sanity solo se consulta en build. Studio es una aplicación y un repositorio separados; no reintroducirlo en Astro.
- Mantén los IDs singleton restaurant-settings, restaurant-story y restaurant-gallery; las cuatro rutas lógicas y las referencias de categorías deben ser válidas.
- Si cambia un contrato, coordina el schema del repositorio Studio con GROQ, Zod, mock y exportador de ejemplo.
- No mezcles silenciosamente demo y CMS. Un dataset vacío usa demo explícita. Un CMS que falla o publica datos inválidos debe detener la build salvo alternativa demo explícita con aviso.
- No simules reservas ni formularios enviados. Solo activa el enlace HTTPS del proveedor para contenido real y restaurante no ficticio.
- Antes de entregar: npm run check, npm test, npm run build, npm run check:build y npm run check:cms; el Studio ejecuta check/build en su propio repositorio. Si faltan red/dependencias, indica exactamente qué no se pudo ejecutar.
- No despliegues ni configures SiteGround. Trabaja en rama de función y prepara PR; no hagas merge sin indicación.

- Iteración 1: mantener opcionales page.composition, settings.editorial y settings.socialImage. La fixture editorial común y docs/editorial-compatibility.md coordinan el contrato. No materializar defaults en documentos ni convertir composiciones originales a bloques automáticamente.
