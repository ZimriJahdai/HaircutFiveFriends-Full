---
tags: [haircutfivefriends, documentacion/backend, refactor]
date: 2026-06-13
---

# Progreso del refactor — AiServiceServer (+ client)

Log por fases del refactor de núcleo crítico. Contexto y auditoría en
[[2026-06-13-auditoria-ai-services]]. Servicios: [[AiServiceServer]], [[AiServiceClient]], [[Gemini]].

## FASE 1 — Consistencia Gemini / ADC (centralización)

**Resumen:** se unificó toda la configuración de [[Gemini]]/Vertex en un solo módulo y se eliminó la
instanciación duplicada del cliente y el drift de modelos.

**Decisiones técnicas (verificadas, no a ciegas):**
- SDK `@google/genai` **v1.50.1**: modo correcto = `vertexai: true` + `project` + `location`.
  **No existe** opción `enterprise`; `GOOGLE_GENAI_USE_ENTERPRISE` del `.env` es **variable muerta**.
- `httpOptions.timeout` (ms) es soportado por el SDK → se usa para timeout de Gemini.
- Singleton **perezoso** (`getGenAI()`): importar el módulo nunca lanza; la validación de env se hará
  en bootstrap (Fase 2), respetando la indicación de no lanzar en import.
- Default de texto cambiado al ID **estable** `gemini-3.1-flash-lite` (el `.env` aún fija `-preview`;
  se reporta para que el usuario lo migre tras confirmar acceso GCP — no se edita `.env`).

**Archivos creados:**
- `AiServiceServer/configs/genai.js` — exporta `getGenAI()` (singleton + timeout), `MODELS {TEXT,IMAGE,LIVE}`,
  `GCP_PROJECT`, `GCP_LOCATION`, `validateGenaiEnv()`.

**Archivos editados:**
- `services/genaiService.js` — usa `getGenAI()` + `MODELS`; eliminado init local y el `throw` de import.
- `src/ai/chatbot.js` — eliminado `new GoogleGenAI` por-llamada; usa `getGenAI()` + `MODELS.TEXT`.
- `src/reviews/reviews.controller.js` — idem; usa `getGenAI()` + `MODELS.TEXT`.
- `src/ai/live-api.js` — usa `MODELS.LIVE` (en vez del modelo hardcodeado) + `GCP_PROJECT/LOCATION`
  centralizados. **No** se tocó el endpoint `v1beta1` ni el modelo en sí.

**Verificación:**
- `node --check` en los 5 archivos → OK.
- `grep` confirma que ningún source fuera de `configs/genai.js` instancia `GoogleGenAI` ni hardcodea modelos.

**Pendientes / riesgos:**
- `.env` real usa `gemini-3.1-flash-lite-preview` y conserva `GOOGLE_GENAI_USE_ENTERPRISE` (muerta) →
  reportar en Fase 4 / reporte final. (Confirmado: import de `configs/genai.js` resuelve `MODELS.TEXT`
  a `-preview` porque el `.env` lo fija.)
- Logging verboso de payloads de audio en `live-api.js` (deuda, no crítico).

## FASE 2 — Robustez: timeouts, validación, errores

**Resumen:** se añadieron timeouts a llamadas externas, validación de inputs, un error-handler central
que no filtra detalles internos, y validación de entorno en bootstrap (no en import).

**Archivos creados:**
- `middlewares/error-handler.js` — error middleware `(err,req,res,next)`. Mapea 429/503→503,
  4xx passthrough, resto→500; mensaje genérico al cliente; `detail` solo si `NODE_ENV!==production`;
  log completo (con stack) solo en server.

**Archivos editados:**
- `configs/genai.js` (Fase 1) ya inyecta `httpOptions.timeout` (30s, env `GENAI_TIMEOUT_MS`) → timeout Gemini.
- `src/ai/barber-tools-executor.js` — `axios.create({ timeout })` (15s, env `HTTP_TIMEOUT_MS`).
- `src/auth/auth.routes.js` — valida `email` (regex) y `password` → 400; `timeout` en `axios.post`.
- `src/reviews/reviews.controller.js` — valida `barberId` (ObjectId 24-hex o numérico) → 400; `timeout`
  en `axios.get`.
- `src/index.js` — validación de env en bootstrap (`validateGenaiEnv()` + `JWT_SECRET`; warn si falta
  `URI_MONGO`) con `process.exit(1)` y mensaje claro; monta `errorHandler` tras las rutas.

**Decisiones:**
- `GET /reviews/analyze/:barberId` **se deja público** (no se añade `validateJWT`) hasta confirmar que
  ningún cliente depende de acceso sin token — solo se documenta.
- Catches de reviews/auth ya devolvían mensajes genéricos (sin leak) → se conservan; el handler central
  cubre el `next(err)` de `aiHaircut.controller` que antes caía al default de Express (leak de stack).

**Verificación:**
- `node --check` en los 5 archivos → OK.
- Import-test de `configs/genai.js` → OK, sin throw; `validateGenaiEnv()` = `[]` (project sí está en `.env`).

**Pendientes / riesgos:**
- Boot completo + smoke con Mongo arriba → Fase 6.

## FASE 3 — Refactor estructural mínimo del server

**Resumen:** separación de lógica de negocio del controller de reseñas y confirmación (sin tocar) del
bootstrap duplicado.

**Decisión sobre entrypoints (confirmada en `package.json`):**
- Entry vivo = `src/index.js` (`main` + scripts `start`/`dev`).
- `index.js` (raíz) + `configs/app.js` (`initServer`) = **código muerto** (ningún script lo invoca, otro
  base path `/Gemini/api/v1`, otra fn de DB, sin rutas reales). Por la indicación de no eliminar a la
  ligera, **NO se borra**: queda como deuda técnica documentada (candidato a eliminar en 2ª pasada).
- `configs/cors-configuration.js`/`helmet-configuration.js` pertenecen al bootstrap muerto; el entry vivo
  usa `cors()` inline. No se consolidó para no arriesgar; se anota como deuda.

**Archivos creados:**
- `src/reviews/reviews.service.js` — `analyzeReviewsWithAI(reviews)` (prompt + llamada Gemini).

**Archivos editados:**
- `src/reviews/reviews.controller.js` — ahora solo orquesta: valida `barberId`, hace fetch de reseñas
  (con timeout), llama al service y responde; errores vía `next(error)` (handler central).

**Verificación:** `node --check` OK en ambos.

**Pendientes / riesgos:**
- Deuda: eliminar bootstrap muerto (`index.js` + `configs/app.js`) y consolidar cors/helmet en el entry
  vivo — 2ª pasada, requiere confirmación.

## FASE 5 — Fixes críticos NO visuales del cliente

**Resumen:** se eliminaron fugas de requests (AbortController) y se mejoraron estados/accesibilidad.
Sin tocar diseño ni migrar a Tailwind (2ª pasada).

**Archivos editados:**
- `services/{chatApi,visionApi,authApi,arApi}.js` — aceptan `signal` opcional (compatibles hacia atrás).
- `hooks/useChat.js` — `AbortController` para historial (reemplaza el flag `isMounted`) y para el envío
  en vuelo (ref + abort al desmontar); ignora `AbortError`.
- `pages/VisionPage.jsx` — `AbortController` para `recommendHaircuts`/`sendOverlayToAr` (la petición más
  larga) con abort al desmontar; ignora `AbortError`. Sin reestructurar el componente.
- `pages/LoginPage.jsx` — abort al desmontar; `disabled` en inputs durante loading; `autoComplete`,
  `aria-busy`, `role="alert"` en el error.
- `components/ChatForm.jsx` — `aria-label` en el input (antes solo placeholder).

**Verificación:**
- `npm run build` (cliente) → OK (46 módulos, build en ~0.3s).
- `npm run lint` (cliente) → 10 problemas (8 errores, 2 warnings) **preexistentes**: baseline con mis
  cambios stasheados da exactamente los mismos 10. **0 nuevos** introducidos. (Errores en `VoicePage`,
  `authStorage`, `pcm-worklet`, efecto AR de `VisionPage` — fuera de alcance.)

**Pendientes / riesgos:**
- 2ª pasada: dividir `VisionPage`/`VoicePage`, migrar `index.css` a Tailwind, corregir lint preexistente,
  tests (Vitest + Testing Library).

## FASE 6 — Verificación

**Servidor (`AiServiceServer`):**
- No existen scripts `lint` ni `test` en `package.json` (solo `start`/`dev`) → se reporta, no se inventa.
- `node --check` OK en todos los archivos tocados/creados.
- Boot real: `node src/index.js` arranca, conecta MongoDB (local) y escucha en :3007. Sin errores de
  import. Validación de env en bootstrap OK.
- Smoke (servidor en background, curl):
  - `GET /api/health` → 200.
  - `GET /api/reviews/analyze/abc` → **400** `{"error":"barberId invalido."}`.
  - `POST /api/auth/login` email inválido → **400**; sin password → **400**.
  - `GET /api/reviews/analyze/<24hex>` con barber API (:3006) caído → **500**
    `{"error":{"message":"Error interno del servidor."}}` → **sin stack ni detalles internos** (handler
    central OK).
  - Ruta desconocida → 404.

**Cliente (`AiServiceClient`):** `npm run build` OK; `npm run lint` sin errores nuevos (ver Fase 5).

**Pendiente:** suite de tests automatizados (2ª pasada).
