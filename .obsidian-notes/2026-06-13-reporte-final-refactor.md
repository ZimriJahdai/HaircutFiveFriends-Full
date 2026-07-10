---
tags: [haircutfivefriends, documentacion/backend, documentacion/frontend, refactor, reporte]
date: 2026-06-13
---

# Reporte final — Refactor núcleo crítico (AiServiceServer + AiServiceClient)

Primera pasada del `prompt.md`. Detalle por fases en [[2026-06-13-refactor-ai-services-progreso]];
auditoría en [[2026-06-13-auditoria-ai-services]]; seguridad en [[2026-06-13-seguridad-env]].
Servicios: [[AiServiceServer]], [[AiServiceClient]], [[Gemini]].

## 1. Bugs corregidos

| Bug | Archivo | Causa raíz | Fix | Verificación |
|---|---|---|---|---|
| Cliente GenAI instanciado por llamada | `src/ai/chatbot.js`, `src/reviews/reviews.controller.js` | `new GoogleGenAI` en cada request | Singleton perezoso `getGenAI()` en `configs/genai.js` | `node --check` + boot OK |
| `throw` al **importar** genaiService | `services/genaiService.js` | validación de env en top-level | Movida a `validateGenaiEnv()` en bootstrap | boot OK; import no lanza |
| Sin timeout en llamadas Gemini | `configs/genai.js` | sin `httpOptions` | `httpOptions.timeout` (30s, `GENAI_TIMEOUT_MS`) | import test OK |
| Sin timeout en HTTP externos | `reviews.controller.js`, `auth.routes.js`, `barber-tools-executor.js` | `axios` sin `timeout` | `timeout` 15s (`HTTP_TIMEOUT_MS`) | code review |
| `barberId` sin validar | `reviews.controller.js` | acepta cualquier valor | regex ObjectId/numérico → 400 | curl → 400 |
| Login sin validar | `auth.routes.js` | proxy directo | valida email (regex) + password → 400 | curl → 400 |
| Errores que filtran stack | global / `aiHaircut.controller` (`next(err)` al default Express) | sin error-handler central | `middlewares/error-handler.js` montado | curl 500 sin stack |
| Fugas de fetch al desmontar | `services/*`, `hooks/useChat.js`, `pages/VisionPage.jsx`, `pages/LoginPage.jsx` | sin `AbortController` | `signal` + abort en cleanup | build OK |

## 2. Malas prácticas eliminadas

| Problema | Archivo | Cambio | Motivo |
|---|---|---|---|
| Modelos con defaults divergentes | chatbot/reviews vs genaiService | `MODELS {TEXT,IMAGE,LIVE}` central | evitar drift |
| Modelo Live hardcodeado | `src/ai/live-api.js:128` | `MODELS.LIVE` (env `VERTEX_LIVE_MODEL`) | configurable, sin tocar el modelo |
| Lógica de negocio en controller | `reviews.controller.js` | extraída a `reviews.service.js` | controller solo orquesta |
| Project/location repetidos | `genaiService`, `chatbot`, `live-api`, `reviews` | `GCP_PROJECT`/`GCP_LOCATION` central | DRY |
| Inputs sin label accesible | `ChatForm.jsx`, `LoginPage.jsx` | `aria-label`/`autoComplete`/`aria-busy`/`role=alert` | accesibilidad |

## 3. Estado real de Gemini / Google Cloud

- **SDK detectado y final:** `@google/genai` **v1.50.1** (sin cambios de versión).
- **Backend final:** Gemini en **Vertex AI con ADC** (`vertexai: true` + project + location). Confirmado:
  el SDK **no** tiene opción `enterprise`; `GOOGLE_GENAI_USE_ENTERPRISE` es **variable muerta**.
- **Variables finales:** `GOOGLE_CLOUD_PROJECT`(+`GOOGLE_PROJECT_ID` fallback), `GOOGLE_CLOUD_LOCATION`
  (+`GOOGLE_VERTEX_LOCATION`), `VERTEX_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`(+`VERTEX_IMAGE_MODEL`),
  `VERTEX_LIVE_MODEL` (nueva), `GENAI_TIMEOUT_MS`, `HTTP_TIMEOUT_MS`. Documentadas en `.env.example`.
- **Modelos usados (verificados contra docs Vertex jun-2026, no a ciegas):**
  - Texto: default de código → `gemini-3.1-flash-lite` (estable). **El `.env` aún fija
    `gemini-3.1-flash-lite-preview`** → recomendado migrar tras confirmar acceso GCP.
  - Imagen: `gemini-3-pro-image-preview` (sin cambiar).
  - Live: `gemini-3.1-flash-live-preview` (sin cambiar; solo movido a env).
- **Modelos descartados/reemplazados:** ninguno cambiado a ciegas; solo se unificaron defaults.
- **ADC:** migración **confirmada completa** (sin API keys ni `fetch` manual; Live usa `GoogleAuth`).
  No se tocó el endpoint `v1beta1` del WebSocket (pendiente de confirmar vs `v1`).

## 4. Cambios de rendimiento

- Cliente GenAI **singleton** (antes se creaba por request en 2 módulos).
- **Timeouts**: Gemini (30s) y HTTP externos (15s) → evita cuelgues indefinidos.
- **Retry/backoff**: ya existía `generateWithRetry` (429/503) en `genaiService`; se conserva. El SDK
  además soporta `retryOptions` (no forzado).
- **Streaming**: no implementado (fuera de alcance de la pasada; el flujo actual no lo requiere).
- Menos llamadas innecesarias en cliente (AbortController cancela requests al navegar/desmontar).

## 5. Cambios del cliente

- Servicios `chatApi/visionApi/authApi/arApi` aceptan `signal` (cancelables).
- `useChat` con `AbortController` (historial + envío); `VisionPage` y `LoginPage` abortan al desmontar.
- A11y: labels/aria en chat y login; estados `disabled`/`aria-busy` durante requests.
- CSS: **no** modificado (Tailwind incremental = 2ª pasada). Sin migración de `index.css`.

## 6. Tests

- **No se crearon** tests en esta pasada (diferido a 2ª pasada por decisión de alcance).
- Verificación realizada: `node --check`, boot real del server, smoke con `curl`, `build` + `lint`
  del cliente. Detalle en [[2026-06-13-refactor-ai-services-progreso]].

## 7. Seguridad

- `.env` de ambos servicios (y raíz + Frontend, fuera de alcance) **trackeados en git**;
  server incluye `JWT_SECRET`. `.gitignore` no los excluye.
- **Acción hecha:** creados `AiServiceServer/.env.example` y `AiServiceClient/.env.example` (sin valores).
- **Requiere acción humana:** rotar `JWT_SECRET`, añadir `.env`/`.env.*` a `.gitignore`,
  `git rm --cached` los `.env`, eliminar `GOOGLE_GENAI_USE_ENTERPRISE`. Pasos en [[2026-06-13-seguridad-env]].
- No hay API keys ni service-account JSON hardcodeados en el código.

## 8. Deuda técnica pendiente

| Pendiente | Prioridad | Riesgo | Recomendación |
|---|---|---|---|
| Rotar `JWT_SECRET` + dejar de trackear `.env` | Alta | Secreto expuesto en historial | Hacer ya (manual) |
| `.env` usa modelo `-preview` | Media | Posible deprecación | Cambiar a `gemini-3.1-flash-lite` tras confirmar acceso |
| Bootstrap muerto (`index.js`+`configs/app.js`) | Media | Confusión/mantenimiento | Eliminar y consolidar cors/helmet (2ª pasada) |
| Endpoint `v1beta1` Live API | Media | Versión vs `v1` | Confirmar y, si aplica, migrar |
| `GET /reviews/analyze/:barberId` sin auth | Media | Endpoint público | Confirmar dependencias y añadir `validateJWT` |
| Tailwind sin usar + `index.css` 670 líneas | Media | Inconsistencia UI | Migración incremental (2ª pasada) |
| `VisionPage`/`VoicePage` sobredimensionados | Baja | Mantenibilidad | Dividir en sub-componentes |
| Lint preexistente del cliente (8 err) | Baja | Calidad | Corregir en 2ª pasada |
| Sin tests | Media | Regresiones | Vitest/Supertest (server) + Vitest/Testing Library (client) |
| Logging verboso de audio en `live-api.js` | Baja | Ruido/perf | Reducir logs |
| Temp files de `base64ImageService` sin limpiar | Baja | Disco | TTL/limpieza |

## 9. Estado final

- **Funciona y verificado:** server arranca y conecta Mongo; validaciones 400; error-handler sin leaks;
  modelos/cliente Gemini centralizados; cliente compila (`build`) sin errores nuevos.
- **No verificado en runtime:** llamadas reales a Gemini/Vertex (requieren ADC + cuotas del proyecto);
  WebSocket Live API end-to-end; integración con barber API (:3006) y AR.
- **Requiere acción humana:** rotación de secretos y limpieza de `.env` en git; confirmar IDs de modelo
  `-preview` vs estable según acceso GCP; decidir auth de la ruta de reviews.
- **Diferido (2ª pasada, requiere OK):** Tailwind incremental + split de páginas + suite de tests +
  limpieza de bootstrap muerto.
