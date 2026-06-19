---
tags: [haircutfivefriends, documentacion/backend, documentacion/frontend, fix, live-api]
date: 2026-06-13
---

# Fixes — Auth DB, Live API 404, y persistencia de chat de voz

Sesión de depuración + features sobre [[AuthService]], [[AiServiceServer]] y [[AiServiceClient]].
Cuatro bloques: arranque de Auth, conexión Live API, reproducción de voz en el cliente, y
guardado del chat de voz. Continúa el trabajo de [[2026-06-13-auditoria-ai-services]] y
[[2026-06-13-reporte-final-refactor]].

## 1. [[AuthService]] no arrancaba — `no existe la base de datos "HaircutFiveFriends"`

- **Síntoma:** `pnpm run dev` fallaba con `SequelizeConnectionError` / código `3D000` (FATAL).
- **Causa real:** **dos** procesos escuchando en el puerto `5432`: el contenedor Docker
  `HaircutFiveFriends` (que sí tiene la DB, creada vía `POSTGRES_DB` en `docker-compose.yml`)
  **y** un **PostgreSQL nativo de Windows** (PID detectado con `netstat -ano | findstr :5432` →
  `Get-Process`). Node conectaba al postgres nativo, que **no** tiene la DB.
- **Diagnóstico clave:** Sequelize crea **tablas**, no **bases de datos**. El `docker-compose.yml`
  sí crea la DB automáticamente; el problema era a qué postgres llegaba la conexión.
- **Solución (elegida por el usuario):** liberar el puerto / usar el postgres correcto. Opciones
  dadas: crear la DB en el postgres nativo, cambiar el puerto del contenedor a `5433`, o detener
  el servicio nativo de Windows.

## 2. [[Live API]] devolvía `404 Unexpected server response` en el handshake

Archivo: `AiServiceServer/src/ai/live-api.js`. Dos problemas distintos, mismo síntoma inicial.

- **2a. URL con versión equivocada.** El `404` salía en el *handshake* HTTP del WebSocket (antes de
  enviar el `setup`) → la URL no resuelve. El código usaba `...aiplatform.v1beta1.LlmBidiService...`.
  La doc oficial (notebook `GoogleCloudPlatform/generative-ai`) usa **`v1`**:
  ```
  wss://{loc}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent
  ```
  → corregido `v1beta1` → `v1`.
- **2b. Modelo inexistente en Vertex.** El `.env` y `configs/genai.js` usaban
  `gemini-3.1-flash-live`, que **NO existe en Vertex AI** (solo en AI Studio,
  `generativelanguage.googleapis.com`, con API key — no ADC). En Vertex el modelo Live GA es
  **`gemini-live-2.5-flash-native-audio`**. `gemini-2.0-flash` y `flash-lite` fueron **apagados el
  1-jun-2026** (no usar).
- **Decisión del usuario:** mantener arquitectura **Vertex + ADC** y usar
  `gemini-live-2.5-flash-native-audio` (en `VERTEX_LIVE_MODEL` del `.env` y default en `genai.js`),
  en vez de migrar el socket Live a AI Studio.
- **Nota:** `gcloud ai models list` solo lista modelos **custom subidos**, no los de Model Garden/
  publisher → inútil para comprobar disponibilidad de modelos Live.

## 3. [[AiServiceClient]] — voz del modelo no se escuchaba

Archivo: `AiServiceClient/src/app/hooks/useVoiceSession.js`. El audio del modelo **sí llegaba** con
datos reales (los `serverContent.modelTurn.parts[].inlineData` no eran ceros), pero no sonaba.

- **Bug A (autoplay):** el `AudioContext` de salida se creaba **dentro de `onmessage`**, fuera del
  gesto del usuario → nacía `suspended` y `resume()` quedaba bloqueado. → se crea y `resume()` ahora
  en `startRecordingNow` (dentro del clic).
- **Bug B (cierre prematuro):** `stopRecording` → `cleanupAudio` cerraba el context de salida, pero
  el modelo responde **después** de soltar el micrófono → no se reproducía. → `cleanupAudio` ya no
  cierra la salida; nuevo `closeOutput()` solo en `disconnect` / `onclose` / unmount.
- **Mic en ceros (`AAAA...` = PCM16 de silencio):** era un **fallo de hardware del micrófono del
  usuario**, no del código. La captura/worklet estaban correctas.

## 4. Persistencia del chat de voz (feature)

Objetivo del usuario: guardar el chat de voz como el [[chatbot]] — usuario **verbatim** y modelo
**resumido** con `gemini-2.5-flash-lite` para no inflar tokens del Live — y que el Live cargue el
historial **en el primer mensaje**.

- **Causa de "no se guardaba nada":** el `setup` pedía `responseModalities: ['AUDIO']` y **no**
  habilitaba transcripción → en modo audio no llega `inputTranscription`/`outputTranscription` ni
  texto en `modelTurn`. Nada que guardar.
- **Cambios:**
  - `configs/genai.js`: nuevo modelo `MODELS.SUMMARY = gemini-2.5-flash-lite`
    (`VERTEX_SUMMARY_MODEL`).
  - `services/genaiService.js`: `summarizeAssistantReply(text)` → llama al modelo SUMMARY con prompt
    simple; fallback al texto completo si falla.
  - `src/ai/live-api.js`:
    - `setup` ahora con `inputAudioTranscription: {}` + `outputAudioTranscription: {}`.
    - Acumulación de la transcripción **por turno**; al `serverContent.turnComplete` →
      `finalizeTurn()` guarda usuario (verbatim) y modelo (resumido) en la colección `Chat`
      (`channel: 'voice'`, mismo `userId` que el chatbot).
    - **Historial en el primer mensaje:** el envío del `setup` se **gatea** hasta recibir el token
      del cliente (`userId`); `buildHistoryText(userId)` inyecta los últimos `HISTORY_LIMIT = 10`
      mensajes en el `systemInstruction`. Fallback: si el token tarda > 600 ms, setup sin historial.
- **Verificación:** `node --check` OK en los 3 archivos del server.

## Pendiente

- **Voz robótica + espacios entre palabras** en la reproducción del cliente. Causa probable: gaps en
  el scheduling (cada chunk = `bufferSource` nuevo). Posible fix: colchón/crossfade en
  `playbackTimeRef`. No tocado aún.

## Decisiones del usuario (recordar)

- Modelos/SDK/auth/entrypoints: **no cambiar a ciegas**, confirmar contra docs/versión instalada.
- Live se queda en **Vertex + ADC** con `gemini-live-2.5-flash-native-audio`.
- Resumen de voz con `gemini-2.5-flash-lite`.
