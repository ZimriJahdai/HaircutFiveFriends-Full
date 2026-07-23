---
tags: [haircutfivefriends, documentacion/backend, documentacion/frontend, auditoria]
date: 2026-06-13
---

# Auditoría inicial — AiServiceServer + AiServiceClient

Resumen del análisis previo al refactor (Fase 0 del `prompt.md`). Refactor acotado **solo** a
[[AiServiceServer]] y [[AiServiceClient]]. Decisiones de alcance acordadas con el usuario al final.

## Arquitectura real detectada

- **[[AiServiceServer]]** (puerto 3007): Express 5 + MongoDB (Mongoose) + [[Gemini]] vía `@google/genai`
  en modo **Vertex AI + ADC** (`vertexai: true`). ESM (`"type": "module"`). Entry real: `src/index.js`
  (confirmado en `package.json` → `main` + scripts `start`/`dev`).
  - Rutas montadas en `src/index.js`: `/api/auth`, `/api/chat`, `/api/vision`, `/api/ai-haircut`,
    `/api/ai-haircut-image`, `/api/reviews`, `/api/health`, `/api-docs` (Swagger). WebSocket Live API
    vía `setupLiveApi(wss)`.
  - **Bootstrap duplicado / muerto:** `index.js` (raíz) → `configs/app.js` `initServer()` **no lo usa
    ningún script**; monta otro base path (`/Gemini/api/v1`), otra función de DB (`dbConnection`) y
    ninguna ruta real. Es código huérfano. → deuda técnica, no se elimina en esta pasada.
- **[[AiServiceClient]]** (~5174): React 19.2 + Vite 8 + react-router 6. Proxy Vite `/api`→`:3007`,
  `/ws`→`ws://:3007`. **Tailwind v4 instalado e importado pero sin usar** (CSS legacy de 670 líneas en
  `src/styles/index.css`).

## Comunicación cliente ↔ servidor

- El cliente llama por `fetch` a través del proxy Vite (`/api/...`) a [[AiServiceServer]].
- Endpoints usados por el cliente:
  - `POST /api/auth/login` (`services/authApi.js`)
  - `GET|POST|DELETE /api/chat[/:userId]` (`services/chatApi.js`, `hooks/useChat.js`)
  - `POST /api/vision/recommend` (`services/visionApi.js`)
  - WebSocket de voz `/ws` (`hooks/useVoiceSession.js`)
  - AR externo (`services/arApi.js`, `VITE_AR_BASE_URL` / `VITE_AR_WS_URL`, distinto microservicio)
- [[AiServiceServer]] a su vez llama al API de negocio HaircutFiveFriends
  (`http://localhost:3006/HaircutFiveFriends/api/v1`) desde `barber-tools-executor.js` y
  `reviews.controller.js`.

## Dónde se llama a [[Gemini]]

| Punto | Archivo | Modelo (default/var) |
|---|---|---|
| Chatbot texto + tools | `src/ai/chatbot.js` | `VERTEX_TEXT_MODEL` |
| Análisis facial (vision) | `services/genaiService.js` `describeFace` | `VERTEX_TEXT_MODEL` |
| Generación imagen corte | `services/genaiService.js` `proposeHaircutImage` | `GEMINI_IMAGE_MODEL` |
| Análisis de reseñas | `src/reviews/reviews.controller.js` | `VERTEX_TEXT_MODEL` |
| Voz tiempo real (Live API) | `src/ai/live-api.js` | hardcodeado `gemini-3.1-flash-live-preview` |

## Estado [[Gemini]] / Google Cloud / ADC

- **SDK:** `@google/genai` **v1.50.1** (confirmado en `node_modules`). Interfaz `GoogleGenAIOptions`
  soporta `vertexai`, `project`, `location`, `apiKey`, `apiVersion`, `httpOptions`. **No existe opción
  `enterprise`** → la variable `GOOGLE_GENAI_USE_ENTERPRISE` del `.env` **no la lee el SDK** (muerta).
- **Migración ADC:** efectivamente completa en código. No quedan API keys ni `fetch` manual a Gemini.
  Live API usa `GoogleAuth` (ADC) para Bearer token.
- **Inconsistencias:** cliente GenAI instanciado **por llamada** en `chatbot.js` y `reviews.controller.js`
  (singleton solo en `genaiService.js`); defaults de modelo divergentes entre archivos; modelo Live
  hardcodeado; `httpOptions.timeout` disponible pero **no usado**.
- **Modelos:** verificados contra docs oficiales de Vertex (jun 2026): existen variantes estable y
  `-preview`. El `.env` fija `VERTEX_TEXT_MODEL=gemini-3.1-flash-lite-preview`; se recomienda migrar a
  `gemini-3.1-flash-lite` (estable) tras confirmar acceso del proyecto GCP.

## Estado de Tailwind

- Instalado (`tailwindcss`, `@tailwindcss/vite`), plugin activo en `vite.config.js`, importado en
  `index.css` (`@import "tailwindcss";`), pero **ningún componente usa utilidades** → todo es CSS legacy.
  Migración incremental = **segunda pasada**.

## Riesgos encontrados

- Sin timeouts en llamadas a Gemini ni `axios` (cuelgues potenciales).
- Validación floja: `barberId` y login sin validar; ruta `GET /reviews/analyze/:barberId` **sin auth**.
- Sin error-handler central; catches que solo logean.
- Sin validación de env al arrancar (genaiService lanza error en **import**, no en bootstrap).
- `.env` de ambos servicios **trackeados en git**; `.env` server incluye `JWT_SECRET`. Sin `.env.example`.
- Cliente: `fetch` sin `AbortController`; `VisionPage.jsx` (452 líneas) y `VoicePage.jsx` (218)
  sobredimensionados; estados loading/disabled inconsistentes.
- Sin tests en ningún servicio.

## Plan por fases (alcance acordado)

Primera pasada (**núcleo crítico**): F1 Gemini/ADC centralizado · F2 timeouts/validación/errores ·
F3 refactor mínimo server · F4 seguridad (solo reportar + `.env.example`) · F5 fixes no visuales client.
**Segunda pasada (pendiente OK):** Tailwind incremental, split de páginas, suite de tests.

Decisiones del usuario: seguridad = **solo reportar** (no tocar git); modelos/SDK/auth/entrypoints =
**no cambiar a ciegas**; validar env en **bootstrap**, no en import.
