# DETAILED TASK SPECIFICATION: FIXED LIVE TRANSCRIPTION, DB TIMESTAMPS, VOICE MEMORY COMPRESSION, AND WINDOWING

Estamos trabajando en el ecosistema HaircutFiveFriends. Específicamente, necesitamos realizar correcciones de sincronización, optimización de guardado de historiales e interfaces de usuario en la plataforma de IA: backend (AiServiceServer :3007) y frontend (AiServiceClient :5174).

Por favor, lee la estructura completa de ambos proyectos en `.obisidian-notes/AGENT-CONTEXT.md` y `.obisidian-notes/estructura/AiServiceServer.md` / `AiServiceClient.md` antes de modificar nada. Sigue estrictamente las directrices del stack de cada servicio (React 19 + Tailwind v4 + Zustand para frontend; Node.js Express + Mongoose para backend).

Debes implementar/solucionar las siguientes 5 tareas de manera integral:

---

## TAREA 1: Reparar Velocidad y Truncamiento de Transcripciones del Modelo Live
*   **Problema Detectado:** En la interfaz de voz (Live API), la transcripción de las respuestas generadas por el modelo de IA se renderiza demasiado rápido, se corta, se encabalga o no llega a mostrarse de forma completa. Esto suele ocurrir porque los eventos WebSocket acumulan/sobreescriben de forma inestable los fragmentos temporales de audio-transcripción (`content` o `text` del stream) antes de recibir el flag de finalización de turno (`turnComplete` / `isFinal`).
*   **Qué revisar:** Revisa el Hook de audio (`AiServiceClient/src/app/hooks/useLiveAudio.js` o similar) y el manejador del WebSocket en el cliente.
*   **Solución requerida:** 
    1. Implementa un buffer de acumulación estable para el texto entrante del modelo Live.
    2. No actualices destructivamente el estado de la UI con fragmentos efímeros. Acumula el texto incrementalmente y actualiza el estado de forma progresiva.
    3. Asegura que al completarse el turno del modelo (señal de finalización del Live API), el mensaje se guarde completo y limpio en el estado del chat.

---

## TAREA 2: Timestamps de Interacción y Base de Datos (Mongoose)
*   **Qué revisar:** Revisa el esquema de chat/historial en `AiServiceServer/src/chats/chat.model.js` (o el modelo que maneje las colecciones de mensajes).
*   **Solución requerida:**
    1. Asegura que cada objeto de mensaje individual dentro del array de la conversación contenga un campo de marca de tiempo explícito (ej: `timestamp` o `createdAt` tipo `Date`, con valor por defecto `Date.now`).
    2. Al guardar cada interacción (tanto el mensaje del usuario como el de la IA), captura y persiste el momento exacto en el que ocurrió el intercambio en la base de datos de MongoDB.

---

## TAREA 3: Visualización de Fecha/Hora Centrada en el Frontend (Estilo Comercial)
*   **Qué revisar:** Modifica la vista de chat en `AiServiceClient/src/app/pages/` (y/o el componente de lista de mensajes).
*   **Solución requerida:**
    1. Al renderizar la lista de mensajes, compara la marca de tiempo (`timestamp`) de cada mensaje con el del mensaje anterior.
    2. Si ha transcurrido **más de 1 hora** de diferencia entre ambos mensajes (o si es el primer mensaje del chat), inserta y renderiza un badge centrado en el medio del chat con la hora/fecha formateada de manera amigable (ej. "Hoy, 14:35", "Ayer, 18:20").
    3. Estiliza el badge centrado usando TailwindCSS (estética minimalista, texto pequeño, color gris atenuado, fondo sutil con bordes redondeados).

---

## TAREA 4: Arreglar Voice-Memory y Estrategia de Compresión con Gemini 3.1 Flash Lite
*   **Problema Detectado:** Las conversaciones sostenidas a través del canal de voz (Live API WebSocket) no se están persistiendo correctamente en la base de datos de historiales (`voice-memory`).
*   **Solución requerida:**
    1. **Verificación y Reparación:** Asegura que el backend (`AiServiceServer/src/ai/live-api.js` o similar) intercepte y guarde en la base de datos MongoDB la sesión de voz en tiempo real cuando esta finalice o de manera interactiva.
    2. **Estrategia de Compresión de Contexto (Evitar Bloat):** Para evitar sobrecargar la ventana de contexto de Gemini en futuras conexiones Live:
        *   **Mensaje del Usuario:** Guárdalo e indexalo **tal cual** (texto transcrito verbatim desde el micrófono).
        *   **Mensaje de la IA (Respuesta del Live):** Para evitar registrar párrafos gigantes o transcripciones inconexas, **haz una llamada en background a `gemini-3.1-flash-lite`** (o el modelo configurado en el servidor para texto) pasándole la transcripción bruta de la IA, ordenándole que genere un **resumen conciso, directo y en lenguaje natural** de su propia respuesta.
        *   **Persistencia:** Guarda en base de datos el mensaje del usuario original + el resumen procesado por Flash Lite para la IA.

---

## TAREA 5: Ventana Deslizable de Contexto (Últimos 10 Mensajes)
*   **Problema Detectado:** El modelo Live tiene un límite estricto de latencia y costos. Si le pasamos todo el historial completo de voz/texto en cada nueva inicialización, el sistema colapsará o tardará mucho en responder.
*   **Solución requerida:**
    1. Al iniciar una nueva conexión WebSocket con la Live API de Vertex, o al enviarle contexto histórico, **filtra la colección cargada de la DB para incluir ÚNICAMENTE los últimos 10 mensajes** (u 10 interacciones de historial depurado).
    2. Esto mantendrá la latencia ultrabaja, evitará el consumo excesivo de tokens y asegurará respuestas inmediatas del agente de voz.

---

### Entregables Esperados:
1.  **Código funcional y limpio:** Sin hacks ni desactivación de reglas de linter o TypeScript.
2.  **Validación de extremo a extremo:** Prueba que los WebSockets no se caigan, que los resúmenes se guarden en MongoDB y que las marcas de tiempo se rendericen correctamente en el frontend.
3.  **Logs actualizados:** Crea el archivo correspondiente en `.obisidian-notes/logs/` detallando los cambios estructurales.
