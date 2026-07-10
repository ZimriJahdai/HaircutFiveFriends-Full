---
tags: [haircutfivefriends, documentacion/frontend, documentacion/backend, live-api, fix]
date: 2026-06-14
---

# Transcripción Live estable, badges de fecha y verificación de voice-memory

Spec de 5 tareas (ver `prompt.md`) sobre [[AiServiceServer]] y [[AiServiceClient]].
Tras auditar el estado real: **3 de 5 ya estaban implementadas** (del trabajo del
[[2026-06-13-fix-auth-db-y-live-voz]]). Solo faltaban Tarea 1 y Tarea 3.

## Estado por tarea

| # | Tarea | Estado | Detalle |
|---|-------|--------|---------|
| 1 | Buffer transcripción Live | **Implementada hoy** | ver abajo |
| 2 | Timestamps en DB | Ya hecho | `chat.model.js`: `timestamp: { type: Date, default: Date.now }` por mensaje; `chat.controller.toStoredMessage` y `live-api.appendVoiceMessage` lo setean |
| 3 | Badge de fecha centrado | **Implementada hoy** | ver abajo |
| 4 | Voice-memory + resumen | Ya hecho | `live-api.finalizeTurn`: usuario verbatim + modelo resumido vía `summarizeAssistantReply` |
| 5 | Ventana 10 mensajes | Ya hecho | `live-api.buildHistoryText` → `slice(-HISTORY_LIMIT)`, `HISTORY_LIMIT = 10` |

**Nota Tarea 4:** el prompt pedía resumir con `gemini-3.1-flash-lite`. Se usa el modelo
configurado `MODELS.SUMMARY = gemini-2.5-flash-lite` (GA, en `us-central1`), respetando la
decisión del usuario de **no usar el preview 3.1** (ver [[2026-06-14-multi-region-genai]]).

## Tarea 1 — buffer de transcripción (`AiServiceClient/src/app/hooks/useVoiceSession.js`)

- **Problema:** la transcripción del modelo llegaba en fragmentos efímeros y el hook hacía
  `appendLog(parsed)` **por fragmento** → la UI mostraba muchas líneas cortadas/encabalgadas.
- **Fix:** acumulación por turno con entrada "viva" de id estable:
  - Refs nuevos: `userTurnRef`, `modelTurnRef` (texto acumulado) + `liveUserIdRef`,
    `liveModelIdRef` (id de la entrada en curso) + `logIdRef` (contador).
  - `upsertLiveLog(role, fullText, idRef)`: crea la entrada la primera vez, luego **reemplaza**
    su texto con el acumulado (no empuja una nueva).
  - En `onmessage`: `inputTranscription.text` → acumula usuario; `modelTurn.parts[].text` +
    `outputTranscription.text` → acumula modelo.
  - `serverContent.turnComplete` → `finalizeTranscriptTurn()` fija el texto y resetea refs;
    el siguiente turno crea entradas nuevas.
- Se eliminó la función `extractText` (ya no se usa). Sin nuevos errores de lint.

## Tarea 3 — badge de fecha (`AiServiceClient/src/app/components/ChatWindow.jsx`)

- `formatDateBadge(value)` → "Hoy, 14:35" / "Ayer, 18:20" / "12 jun 2026, 09:10" (`toLocale*` es).
- `shouldShowBadge(prev, curr)`: true si es el primer mensaje o si hay **> 1 h** de diferencia.
- Render: `Fragment` por mensaje; si toca, badge centrado (Tailwind: `rounded-full`,
  `bg-[rgba(27,27,31,0.06)]`, texto pequeño gris atenuado).
- `messageUtils.createUserMessage` ahora añade `timestamp` ISO → badge estable en el mensaje
  optimista antes de que el server responda con el historial timestampeado.

## Validación

- `pnpm lint`: 10 problemas, **igual que antes** del cambio (todos pre-existentes en
  `VoicePage`/`VisionPage`/`authStorage`/`pcm-worklet` y dos `catch(error)` viejos de
  `useVoiceSession`). Cero nuevos; sin `eslint-disable`.
- `pnpm build`: OK (453 ms, 46 módulos, Tailwind compiló los arbitrary values).
- Backend: `node --check` OK en `live-api.js`, `chatbot.js`, `genaiService.js`.
- **Pendiente de prueba en vivo (requiere mic + Vertex):** que el WS no caiga, que el resumen
  se persista y que los badges aparezcan con datos reales.

Relacionado: [[2026-06-14-multi-region-genai]], [[2026-06-14-chat-ui-redesign]].
