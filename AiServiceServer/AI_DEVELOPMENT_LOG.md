# AI Development Log - TodoGemini Backend
**Fecha:** 19 de Abril de 2026
**Estado:** Lógica de Módulos 1-4 completada.

## Resumen de Implementación
Se ha reestructurado el backend de una arquitectura monolítica a una modular basada en controladores y rutas para integrar la plataforma de IA de la barbería.

### Módulos Implementados:
1. **Chatbot (Módulo 1):**
   - **Modelo:** `gemini-2.5-flash`.
   - **Persistencia:** Integración con MongoDB (`Chat` model) vinculada al `userId`.
   - **Function Calling:** Configurado en `src/ai/tools.js` para consultar servicios, disponibilidad de barberos, creación de citas, puntos de fidelidad y recomendaciones de cortes.
   - **Lógica:** Ubicada en `src/chats/chat.controller.js` y `src/ai/chatbot.js`.

2. **Voz en Tiempo Real (Módulo 2):**
   - **Modelo:** `gemini-3.1-flash-live-preview`.
   - **Tecnología:** WebSocket Proxy nativo implementado en `src/ai/live-api.js`.
   - **Capacidad:** Soporta streaming de audio PCM16 y function calling por voz.

3. **Recomendación Facial (Módulo 3):**
   - **Lógica:** Implementada en `src/vision/vision.controller.js`.
   - **Flujo:** Consume el análisis facial de `HaircutFiveFriends` (API externa) y cruza los resultados con la base de datos de cortes (`haircuts/FaceType`).

4. **Análisis de Reseñas (Módulo 4):**
   - **Lógica:** Implementada en `src/reviews/reviews.controller.js`.
   - **Funcionamiento:** Agrupa reseñas por barbero y utiliza Gemini para generar reportes de insights, sentimientos y áreas de mejora.

### Configuración Técnica:
- **Puerto:** 3007.
- **Middleware:** Aumento de límite de carga a 50MB para procesamiento de imágenes faciales.
- **Variables de Entorno:** Requiere `GEMINI_API_KEY` y `MONGODB_URI`.

---

## Registro adicional (Frontend) - 19 de Abril de 2026

### Modificaciones sobre el trabajo previo (IA anterior)
Se deja registro explicito de ajustes realizados sobre lo ya implementado:

1. **Refactor de App.jsx y logica de chat (React):**
   - Se saco la logica del chat fuera de `App.jsx` y se movio a un hook.
   - Se dividio la UI en componentes reutilizables (header, window, form, footer).
   - Se aislaron las llamadas HTTP del chat en un service dedicado.
   - Se centralizaron constantes (userId y base URL) y helpers de mensajes.

2. **Rutas y layout base del frontend (estructura inicial):**
   - Se agrego routing con `react-router-dom`.
   - Se creo un layout principal (`AppShell`) con sidebar y topbar.
   - Se agregaron paginas base: resumen, chat, voz, vision, resenas y 404.
   - Se implemento un sistema de estilos globales para el dashboard.

### Archivos creados o modificados (Frontend)
- `client/src/app/hooks/useChat.js`
- `client/src/app/services/chatApi.js`
- `client/src/app/utils/messageUtils.js`
- `client/src/app/constants/chat.js`
- `client/src/app/components/ChatHeader.jsx`
- `client/src/app/components/ChatWindow.jsx`
- `client/src/app/components/ChatForm.jsx`
- `client/src/app/components/ChatFooter.jsx`
- `client/src/app/components/SidebarNav.jsx`
- `client/src/app/layouts/AppShell.jsx`
- `client/src/app/routes/AppRoutes.jsx`
- `client/src/app/pages/Dashboard.jsx`
- `client/src/app/pages/ChatPage.jsx`
- `client/src/app/pages/VoicePage.jsx`
- `client/src/app/pages/VisionPage.jsx`
- `client/src/app/pages/ReviewsPage.jsx`
- `client/src/app/pages/NotFound.jsx`
- `client/src/app/App.jsx`
- `client/src/styles/index.css`
- `client/package.json`

---

## Registro adicional (Modulo Voz) - 19 de Abril de 2026

### Modificaciones sobre el trabajo previo (IA anterior)
Se agrega la primera version funcional de la UI de Voz (Live API) y su wiring:

1. **Hook de sesion de voz y envio de audio PCM16:**
   - Se agrego un hook que crea la sesion de WebSocket, captura microfono y envia audio PCM16 a 16kHz.
   - Se agrego parseo basico de mensajes entrantes para mostrar transcripciones/eventos.

2. **UI de Voz con controles y panel de eventos:**
   - Se creo un panel de estado, botones de conectar/desconectar y microfono.
   - Se agrego un log visible de transcripciones y eventos.

3. **Estilos para el modulo de voz:**
   - Se agregaron estilos dedicados para el panel de logs y filas.

### Archivos creados o modificados (Modulo Voz)
- `client/src/app/constants/voice.js`
- `client/src/app/hooks/useVoiceSession.js`
- `client/src/app/pages/VoicePage.jsx`
- `client/src/styles/index.css`

### Ajustes posteriores solicitados
- Se agrego indicador visual de estado (listening, thinking, speaking) y temporizadores para volver a idle.
- Se reemplazo ScriptProcessorNode por AudioWorkletNode para evitar deprecaciones.
- Se agrego reproduccion de audio PCM16 desde Live API y el panel de eventos se oculta por defecto.
- Se alineo el payload de audio con LiveSendRealtimeInputParameters (audio/audioStreamEnd).
- Se ajusto el mimetype a audio/l16;rate=16000 y se reanuda AudioContext para asegurar envio.
- Se corrigio input/outputAudioTranscription a objetos vacios segun tipos del SDK.
- Se desactivo VAD automatico y se envian activityStart/End para forzar turnos de voz.
- Se removio audioStreamEnd en modo VAD manual para evitar el bloqueo de respuesta.
- Se migro Live API a WebSocket raw con setup y mediaChunks segun especificacion oficial.
- Se ajusto el esquema raw: config top-level, endpoint v1beta y realtimeInput.audio.
- Se corrigio setup a BidiGenerateContentSetup con generationConfig.responseModalities y espera de setupComplete.
- Se agrego panel de transcripcion separado para voz del usuario y del modelo.
- Se agrego memoria local en SQLite y se integra al systemInstruction del Live API.
- Se agrego manejo de toolCall en Live API con toolResponse usando los endpoints de barberia.
- Se agrego proxy de login (AuthService) y uso de JWT para chat y tools.
- Se agrego pantalla de login, token dinamico y envio de JWT en chat/voz.
- Se reforzo regla de historial en systemInstruction y persistencia del chat en GeminiDB.

---

## Registro adicional (Modulo Voz Backend) - 19 de Abril de 2026

### Modificaciones sobre el trabajo previo (IA anterior)
Se corrigio la integracion con Live API para ajustarla al SDK @google/genai:

1. **Conexion Live API con callbacks oficiales:**
   - Se elimino el uso de `session.on` (no existe en el SDK) y se uso `callbacks.onmessage` al conectar.

2. **Envio de audio por metodos oficiales:**
   - Se reemplazo `session.send(...)` por `session.sendRealtimeInput(...)` cuando llega `realtimeInput`.
   - Se mantiene soporte para `sendClientContent(...)` si llega un mensaje de texto/control.

### Archivos modificados (Modulo Voz Backend)
- `src/ai/live-api.js`
