# Seguimiento de publicación — iteración 4

Se conserva el webhook Sanity → workflow_dispatch y el workflow único de Astro/GitHub Pages. El dashboard no solicita otra build. No cambian Studio, contenido real, rutas, imágenes ni diseño.

La misma respuesta GROQ usada por el HTML incluye IDs/revisiones. `scripts/deployment-evidence.ts` calcula SHA-256 de `JSON.stringify([projectId,dataset,documentId,revision])`. Durante el workflow escribe `.publication-build.json`, ignorado por Git y fuera de dist. Solo contiene huellas y la identidad de ejecución/intento/SHA. No contiene textos, documentos, IDs sin hash, imágenes ni secretos. Se conserva en un artefacto temporal durante 2 días para que el job final utilice exactamente la evidencia del build.

Los informes de inicio/build/Pages se envían a la función publications del dashboard mediante OIDC GitHub efímero. El backend verifica firma, issuer, audience, vigencia, main, workflow_ref y repositorio/ID registrado. No se añade PAT ni secreto permanente. `id-token: write` se concede solo a jobs que lo necesitan; el job final tiene además actions:read para descargar la evidencia del mismo run.

La publicación de Pages y sus comprobaciones deben terminar correctamente antes del informe de éxito. Si solo falla el seguimiento, se conserva el flujo Pages y se deja una advertencia segura; el dashboard nunca infiere éxito sin evidencia y trata la falta de confirmación mediante expiración explícita. Si el código y la instantánea coinciden con el último despliegue confirmado, se omite Pages y se conserva como prueba la ejecución que sí desplegó. Los informes repetidos son idempotentes.

No se envían informes desde PR ni desde build local/mock. El receptor solo acepta este workflow desde main. Integrar primero el backend y su migración/configuración; después esta actualización Astro. La URL Supabase del script es infraestructura pública, no una credencial. El webhook de Sanity y su autorización GitHub ya existentes no se cambian.

Para recuperar un despliegue fallido, corregir la causa y ejecutar el workflow completo desde main. No repetir una publicación de contenido ni reejecutar solo Pages con evidencia de otro intento. No hay reintentos automáticos.

Prueba funcional: publicar un texto de prueba desde el dashboard. Su estado debe distinguir aceptación Sanity, despliegue y Web actualizada. Abrir la web solo después de la confirmación. La configuración y las pruebas de aislamiento se documentan en `restaurant-platform-dashboard/docs/publication-tracking.md`.
