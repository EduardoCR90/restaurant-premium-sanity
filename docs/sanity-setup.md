# Salitre: Sanity Cloud, Studio independiente y GitHub Pages

## Estado comprobado

Proyecto **Salitre-restaurant**, ID **hfa8zkyw**, dataset **production**. El 30 de octubre de 2026 la lectura pública validó 22 documentos publicados: cuatro páginas y once platos, junto a configuración, historia, galería y categorías. La build con contenido real sigue funcionando.

Studio vive en [EduardoCR90/studio-salitre-restaurant](https://github.com/EduardoCR90/studio-salitre-restaurant) y conserva los ocho tipos originales y los IDs singleton. La fase 1 añade objetos de bloques, enlaces, texto enriquecido, tema y preferencias de módulos sin sustituir documentos. Lee [phase-1.md](phase-1.md) antes de convertir una página existente.

El propietario confirma que Sanity → workflow_dispatch ya está configurado y funciona. Esta sesión no ha publicado contenido, desplegado Studio ni vuelto a disparar el webhook. Las instrucciones siguientes documentan la configuración para mantenerla o reutilizarla en otro restaurante.

## Variables del frontend

`.env.example` contiene los valores públicos reales:

```dotenv
SITE_URL=https://eduardocr90.github.io
SITE_BASE=/restaurant-premium-sanity
SANITY_PROJECT_ID=hfa8zkyw
SANITY_DATASET=production
SANITY_USE_MOCK=false
SANITY_ALLOW_DEMO_FALLBACK=false
SANITY_API_READ_TOKEN=
```

- ID y dataset no son secretos. GitHub Actions usa estos valores de forma predeterminada; pueden sustituirse con variables de repositorio SANITY_PROJECT_ID/SANITY_DATASET.
- El dataset es legible sin token en la verificación realizada. Solo si lo conviertes en privado, añade un token de lectura mínima a `.env` o al secreto de Actions `SANITY_API_READ_TOKEN` del frontend. Nunca uses prefijos PUBLIC_ o SANITY_STUDIO_ para tokens.
- SANITY_USE_MOCK=true es para desarrollo sin conexión y tests deterministas. En el workflow de Pages es false.
- Un dataset accesible sin contenido publicado utiliza demo automáticamente. Los assets sueltos no cuentan como contenido del restaurante.
- Una vez existan documentos publicados se exige contenido coherente: configuración, historia, las cuatro páginas lógicas originales, slugs únicos adicionales y referencias válidas. Una publicación incompleta o una caída de conexión detiene la nueva build; la web publicada anterior permanece disponible. SANITY_ALLOW_DEMO_FALLBACK=true permite volver a demo explícita de forma deliberada, no silenciosa.

La lectura usa el SDK oficial existente, perspectiva published, API fijada en 2025-02-19 y useCdn=false para builds estáticas. `sanity.server.ts` contiene la configuración y el token; solo lo importa la capa de build. Las transiciones del navegador siguen consumiendo HTML estático, sin cliente CMS ni credenciales.

## Publicar Studio sin instalar nada en tu ordenador

1. Integra la PR de instalación del [repositorio Studio](https://github.com/EduardoCR90/studio-salitre-restaurant).
2. En Sanity Manage crea un token de automatización autorizado para publicar Studio y schemas del proyecto. Añádelo **solo** a Settings → Secrets and variables → Actions del repositorio Studio como `SANITY_AUTH_TOKEN`. Un token de lectura no basta; no lo pegues en archivos ni en el chat.
3. Configura allí la variable `SANITY_STUDIO_HOSTNAME` si quieres otro nombre. Se propone `salitre-restaurant-hfa8zkyw`, sin reservar ni garantizar su disponibilidad.
4. Ejecuta el workflow manual **Publish standalone Sanity Studio** desde main. Comprueba que schemas deploy y deploy finalicen correctamente.
5. Abre `https://<hostname>.sanity.studio/`, inicia sesión con tu cuenta Sanity y verifica que puedes editar. El despliegue estático del Studio no da permisos sobre el contenido: los usuarios deben pertenecer al proyecto.
6. Si Sanity requiere CORS, permite el origen HTTPS exacto de Studio con credenciales en Manage → API → CORS origins. Nunca uses comodín con credenciales. Astro consulta en build, por lo que no necesita CORS para el navegador.

Los secretos del repo Studio no se copian al frontend. Studio tiene sus propias dependencias, lock, check y build. Astro conserva únicamente su cliente de lectura y no compila React/Studio.

## Primera carta desde el navegador

El Studio conserva estos apartados:

| Tipo | Contenido | Identificación |
| --- | --- | --- |
| settings | Marca, concepto, contacto y horarios | Singleton restaurant-settings |
| story | Historia, filosofía y chef | Singleton restaurant-story |
| gallery | Galería ordenable | Singleton restaurant-gallery |
| page | Título, ruta, SEO, navegación y bloques ordenables | Slugs originales conservados y nuevas rutas válidas |
| category | Nombre, nota editorial y orden | ID asignado por Sanity |
| dish | Nombre, descripción, precio, imagen, alérgenos y disponibilidad | Referencia a categoría; ID asignado por Sanity |

editorialImage y seo son objetos reutilizados por esos documentos. No se han creado modelos alternativos.

**Solo para un proyecto nuevo:** rellena y publica los tres singletons y las cuatro páginas. El proyecto Salitre ya tiene esos documentos: edítalos, no los dupliques ni vuelvas a importar una semilla. Después crea categorías y platos, publica primero las categorías referenciadas y sube fotografías con alt. La galería puede estar vacía. Mantén isFictional activo mientras se trate de contenido de demostración.

Para la primera carga conviene completar esos documentos antes de activar el webhook. Si publicas solo una parte, una nueva build detectará el contenido incompleto y conservará el despliegue anterior. `npm run check:cms` permite verificar cuándo está completo.

El exportador anterior `npm run seed:export` sigue disponible para conservar el contenido de ejemplo. Solo genera un NDJSON local, no escribe en Sanity. No lo importes con --replace sobre un dataset existente. Si quieres una importación inicial desde Codex Cloud, deberá ejecutarse con autenticación autorizada y revisión del dataset; no se ha realizado en esta entrega.

## Actualización automática al publicar: webhook directo a Actions

GitHub Pages no ejecuta un backend que reciba webhooks. Se aprovecha workflow_dispatch de GitHub, autenticado por su API: no hace falta añadir un servicio ni exponer un token en Astro.

1. En GitHub crea un **fine-grained personal access token** limitado a **EduardoCR90/restaurant-premium-sanity**, permiso de repositorio **Actions: Read and write**, con caducidad. No le des Contents:write por esta integración. Confirma cualquier autorización de organización/SSO que GitHub requiera.
2. Guárdalo únicamente como cabecera privada en el webhook de Sanity. No es el token Sanity de lectura ni el secreto SANITY_AUTH_TOKEN del Studio.
3. En [Sanity Manage](https://www.sanity.io/manage/project/hfa8zkyw) → API → Webhooks → Create webhook:

| Campo | Valor |
| --- | --- |
| Nombre | Reconstruir Salitre en GitHub Pages |
| Dataset | production |
| URL | https://api.github.com/repos/EduardoCR90/restaurant-premium-sanity/actions/workflows/deploy.yml/dispatches |
| Método | POST |
| Eventos | create, update y delete |
| Borradores/versiones | No incluir |
| Content-Type | application/json |
| Cabecera Accept | application/vnd.github+json |
| Cabecera Authorization | Bearer seguido de tu token GitHub privado |
| Cabecera X-GitHub-Api-Version | 2022-11-28 |

Filtro GROQ:

```groq
!(_id in path("drafts.**")) && !(_id in path("versions.**")) && _type in ["settings", "page", "category", "dish", "story", "gallery", "sanity.imageAsset"]
```

Proyección GROQ (cuerpo exacto que necesita GitHub):

```groq
{"ref": "main", "inputs": {"source": "sanity"}}
```

4. Activa el webhook. No incluyas un cuerpo con documentos completo: GitHub espera ref e inputs. El campo Secret de firma de Sanity no sustituye Authorization; GitHub no valida esa firma en workflow_dispatch. La autenticación efectiva es la cabecera privada del token GitHub.
5. Con contenido inicial completo, publica un cambio pequeño en un plato. Revisa la entrega en Sanity y la ejecución **Deploy demo to GitHub Pages** en GitHub. Confirma build/deploy y el cambio de precio/texto en la web.
6. Si falla la entrega, revisa permiso Actions:write, caducidad del token y que deploy.yml esté en main. Si falla la build, revisa documentos y referencias; no publiques demo silenciosamente para ocultar el error.

El workflow mantiene concurrencia para Pages, usa contenido publicado actual en cada build y conserva los controles de rama/entorno existentes. El webhook existente se conserva. No se ha inspeccionado su cabecera privada ni disparado un despliegue desde esta sesión. Los bloques están embebidos en page y tema/módulos en settings: el filtro y la proyección actuales siguen siendo válidos.

## Comprobaciones

Frontend: npm run check, npm test, npm run check:cms, npm run build, npm run check:build. El CI de PRs fuerza demo para verificar UI de forma determinista; el despliegue de Pages siempre consulta el dataset real. Studio: npm ci, npm run check, npm run build en su repositorio.

Los tests comprueban demo, dataset vacío, datos publicados válidos, precios y referencias inválidas y páginas duplicadas. Un fixture de datos publicados no acredita una publicación real en Sanity. Las pruebas de navegación y la ruta base /restaurant-premium-sanity/ permanecen en CI.
