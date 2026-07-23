---
tags: [haircutfivefriends, documentacion/backend, estructura, ai]
date: 2026-06-14
---

# Estructura: AiServiceServer

Servicio backend enfocado en procesamiento de IA, transcripción de voz interactiva en tiempo real y recomendación de estilos basada en rasgos visuales.

---

## 1. Archivos en `src/` y Estructura Principal

```
AiServiceServer/
├── configs/
│   ├── app.js                   # Ajustes comunes de app Express
│   ├── cors-configuration.js    # CORS
│   ├── db.js                    # Conexión Mongoose a 'TodoGemini' / 'GeminiDB'
│   ├── genai.js                 # Inicializador Singleton de Vertex AI (Lazy Load)
│   ├── helmet-configuration.js  # Cabeceras seguras
│   └── swagger.js               # OpenAPI Specs
├── middlewares/
│   ├── error-handler.js         # Controlador global de excepciones
│   └── validate-JWT.js          # Extractor de token de AuthService (Port 3005)
├── src/
│   ├── index.js                 # Entrada principal, co-host de HTTP y WebSockets
│   ├── ai/
│   │   └── live-api.js          # Servidor WebSocket Proxy para Vertex Live API (Voz)
│   ├── aiHaircut/
│   │   ├── aiHaircut.controller.js # Analizador y catalogador de cortes
│   │   └── aiHaircut.routes.js
│   ├── aiHaircutImage/
│   │   ├── image.controller.js  # Generador de simulación visual de cabello
│   │   └── image.routes.js
│   ├── auth/
│   │   ├── auth.controller.js   # Puente de tokens y sesiones
│   │   └── auth.routes.js
│   ├── chats/
│   │   ├── chat.controller.js   # Chatbot con Function Calling de servicios
│   │   ├── chat.model.js        # Historial persistente en MongoDB
│   │   └── chat.routes.js
│   ├── reviews/
│   │   ├── reviews.controller.js # Análisis de sentimiento consolidado por barbero
│   │   └── reviews.routes.js
│   └── vision/
│       ├── vision.controller.js  # Analizador de fotos de rostro (Detección de faceType)
│       └── vision.routes.js
```

---

## 2. Rutas del Servicio (`BASE_PATH = /api`)

* **Chatbot de Texto (`/chat`):**
  - `POST /message` -> Envío de mensaje en lenguaje natural. Soporta Function Calling para interactuar con la base de datos de Port 3006 (citas, servicios).
  - `GET /history/:sessionId` -> Recuperación del historial completo del hilo de chat.
* **Análisis Facial (Vision) (`/vision`):**
  - `POST /analyze-face` -> Procesa una foto base64, detecta la forma del rostro (`faceType`) y retorna haircuts ideales de la base de datos.
* **Generación de Corte (`/ai-haircut-image`):**
  - `POST /generate` -> Ejecuta el modelo de generación de imágenes para simular cortes sugeridos.
* **Análisis de Reseñas (`/reviews`):**
  - `GET /analyze/:barberId` -> Consolida reseñas del barbero en Port 3006, analiza su sentimiento y genera un reporte constructivo de IA.
* **Canal WebSocket de Voz en Vivo (`wss://localhost:3007`):**
  - Recibe audio en tiempo real del browser, consulta tokens OAuth temporales via `google-auth-library` para autenticarse por ADC en Vertex AI y retransmite audio PCM16 interactivo de baja latencia.

---

## 3. Modelos de IA Usados (Vertex AI + SDK `@google/genai`)

| Caso de Uso | Identificador del Modelo | Tipo de Entrada/Salida |
| :--- | :--- | :--- |
| **Chatbot de texto & Functions** | `gemini-3.1-flash-lite` | Texto <-> Texto (con Function Declarations) |
| **Análisis Facial (Vision)** | `gemini-3.5-flash` | Imagen (Base64) -> JSON (faceType) |
| **Generador de Cortes (Image)** | `gemini-3-pro-image-preview` | Texto (Prompt) -> Imagen (PNG/JPEG) |
| **Voz en Tiempo Real (Live API)** | `gemini-3.1-flash-live` | Audio (PCM16 16kHz) <-> Audio (PCM16 24kHz) |
