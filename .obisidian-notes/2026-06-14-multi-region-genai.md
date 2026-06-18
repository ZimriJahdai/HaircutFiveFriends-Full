---
tags: [haircutfivefriends, documentacion/backend, fix, vertex-ai]
date: 2026-06-14
---

# Multi-región en el cliente GenAI — TEXT en `global`, LIVE en `us-central1`

Sesión sobre [[AiServiceServer]]. Continúa [[2026-06-13-fix-auth-db-y-live-voz]].

## Síntoma

`404 NOT_FOUND` en el chatbot:

```
Publisher Model `.../locations/us-central1/.../gemini-3.1-flash-lite` was not found
or your project does not have access to it.
```

Origen: `src/ai/chatbot.js` → `handleChatAI` → `ai.models.generateContent`.

## Causa (dos cosas)

1. **ID incompleto.** El default era `gemini-3.1-flash-lite`; en Vertex el preview se llama
   `gemini-3.1-flash-lite-preview` (el GA aún no salía).
2. **Región equivocada.** Los Gemini **3.x preview** corren solo en el endpoint **`global`**,
   no en `us-central1`. El cliente singleton estaba fijado a `GCP_LOCATION = us-central1`, que
   sí sirve al `LIVE` (`gemini-live-2.5-flash-native-audio`, GA) pero no al texto 3.x.

`location` se fija al construir `GoogleGenAI` y no se puede cambiar por llamada → se necesitan
**dos clientes**, uno por región.

## Cambios

- **`configs/genai.js`**
  - `getGenAI(location?)`: pasó de singleton único a **Map de singletons por región**
    (`_clients`). Sin argumento usa `GCP_LOCATION` (= `us-central1`) → retrocompatible con
    vision/image/reviews/live.
  - Nuevo export `LOCATIONS = { TEXT: VERTEX_TEXT_LOCATION || "global" }`.
- **`src/ai/chatbot.js`** → `getGenAI(LOCATIONS.TEXT)` (global).
- **`src/reviews/reviews.service.js`** → `getGenAI(LOCATIONS.TEXT)` (usa `MODELS.TEXT`, mismo caso).

Resultado: dos regiones vivas a la vez — TEXT en `global`, todo lo demás en `us-central1`.

## Decisión del usuario

- **NO usar `gemini-3.1-flash-lite-preview`.** El usuario fijó `VERTEX_TEXT_MODEL` a un modelo
  **GA (no preview)** él mismo. La fontanería multi-región queda; el modelo de texto lo manda el `.env`.
- Razón del preview-no: el preview requiere allowlist del proyecto y es inestable.

## Nota

`LOCATIONS.TEXT` permite override por `.env` (`VERTEX_TEXT_LOCATION`) sin tocar código.
Ver [[live-api-vertex-config]] y [[no-blind-model-sdk-changes]].

---

## Fix 2 — `400 thought_signature is missing` en function calling

Tras lo anterior, el chatbot llamó a `get_services` (que sí pegó a HaircutFiveFriends
`/service/obtener`) pero el **segundo** `generateContent` reventó:

```
Function call is missing a thought_signature in functionCall parts.
```

- **Causa:** Gemini **3.x** (modelo pensante) adjunta un `thoughtSignature` al part del
  `functionCall` y **exige devolverlo tal cual** en el siguiente turno. El código reconstruía
  el turno del modelo con `{ role:'model', parts:[{ functionCall: call }] }` usando
  `response.functionCalls?.[0]`, que **descarta** la signature → 400.
- **Fix (`src/ai/chatbot.js`):** reusar el `content` original del modelo (trae signature +
  thought parts) en vez de reconstruirlo:
  ```js
  const modelTurn = response.candidates?.[0]?.content
    ?? { role: 'model', parts: [{ functionCall: call }] };
  ```
  Fallback al shape viejo si no hay `candidates`.
- **Nota llamadas paralelas:** la signature va solo en el **primer** `functionCall`; si algún día
  se procesan varias, devolver cada part en su posición exacta.
- Docs: https://ai.google.dev/gemini-api/docs/thought-signatures

Ambos fixes son consecuencia de mover TEXT a Gemini 3.x. Ver [[2026-06-14-chat-ui-redesign]].
