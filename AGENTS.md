# Convenciones de Salitre

- Lee README.md antes de modificar el proyecto. Mantén Astro estático y TypeScript estricto.
- Componentes visuales en src/components; datos y consultas solo en src/lib; contratos en src/types; esquemas en sanity/schemaTypes. Las páginas no consultan directamente al SDK.
- Idioma del sitio y contenido de ejemplo: español. Mantén avisos de restaurante ficticio y noindex en demo.
- Dirección de arte: marfil, carbón, terracota, serif editorial, espacio negativo, composiciones asimétricas. Evita cards genéricas, sombras y degradados.
- Mobile first, HTML semántico, un h1 por página, navegación por teclado, foco visible, imágenes con alt y dimensiones, soporte de movimiento reducido. No añadas JS del cliente sin necesidad.
- Nunca añadas credenciales, archivos .env ni tokens a Git. No uses variables PUBLIC_ para secretos. Sanity solo se consulta en build. Studio es una aplicación separada.
- Mantén los IDs singleton restaurant-settings, restaurant-story y restaurant-gallery; las cuatro rutas lógicas y las referencias de categorías deben ser válidas.
- Si cambia un contrato, actualiza schema Sanity, GROQ, Zod, mock y exportador de ejemplo juntos.
- No mezcles silenciosamente demo y CMS. Un CMS configurado que falla debe detener la build salvo alternativa demo explícita con aviso.
- No simules reservas ni formularios enviados. Solo activa el enlace HTTPS del proveedor para contenido real y restaurante no ficticio.
- Antes de entregar: npm run check, npm test, npm run build y npm run studio:build (con IDs de Studio). Si faltan red/dependencias, indica exactamente qué no se pudo ejecutar.
- No despliegues ni configures SiteGround. Trabaja en rama de función y prepara PR; no hagas merge sin indicación.
