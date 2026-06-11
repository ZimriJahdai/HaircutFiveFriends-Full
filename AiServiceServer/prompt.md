## PLATAFORMA DE IA — HAIRCUTFIVEFRIENDS
### Contexto del ecosistema

Este proyecto es una plataforma de IA independiente que se conecta a dos backends existentes:
- **HaircutFiveFriends** (Node.js + Express + MongoDB): API REST en `http://localhost:3006/HaircutFiveFriends/api/v1`
  con endpoints de clientes, barberos, servicios, citas, reseñas, ventas, haircuts, productos, facturas y estadísticas.
- **AuthService-The5FadeFriends**: Servicio de autenticación independiente.

Las vistas React de esos dos proyectos son proyectos separados. Este proyecto
(TodoGemini) es la plataforma de IA: su propio frontend React + su propio backend Node.js.

---

## PROYECTO 1 — TodoGemini (React + Node.js)

### Stack técnico

**Frontend:**
- React 18 con Vite
- TailwindCSS
- WebSocket nativo del browser (`WebSocket API`) para Live API
- `MediaRecorder API` para captura de audio del micrófono
- `Web Audio API` para reproducción de audio PCM16 en tiempo real

**Backend:**
- Node.js 20+ con Express
- SDK oficial: `@google/genai` (versión >= 1.x, NO usar el deprecated `@google/generative-ai`)
- WebSocket server: librería `ws`
- Variables de entorno: `GEMINI_API_KEY`

### Modelos de Gemini a usar (con sus casos de uso exactos)

| Módulo | Modelo | Propósito |
|---|---|---|
| Chatbot de texto | `gemini-2.5-flash` | Asistente que conoce los endpoints y puede consultar/crear citas, ver servicios, etc. |
| Voz en tiempo real | `gemini-3.1-flash-live-preview` | Live API via WebSocket — audio nativo de baja latencia (reemplaza los deprecated 2.5 flash native audio) |
| Análisis de imagen facial | `gemini-2.5-flash` (vision) | Analizar foto de cara del cliente → detectar forma del rostro → recomendar haircuts de la DB |
| Análisis de reseñas | `gemini-2.5-flash` | Sentiment analysis de reseñas existentes y generación de insights para barberos |
| Nano (ya existe) | Gemini Nano | Endpoint `/analyze` en HaircutFiveFriends — NO reimplementar, solo consumirlo |

### Módulo 1: Chatbot de texto (Gemini 2.5 Flash)

**Funcionamiento:**
- El usuario escribe en un chat y el asistente responde en lenguaje natural
- El sistema prompt le enseña al modelo todos los endpoints disponibles de HaircutFiveFriends
- El modelo usa **Function Calling** para ejecutar llamadas reales a la API:
  - Consultar servicios disponibles → `GET /service/obtener`
  - Ver disponibilidad de barberos → `GET /appointments/barber/:id`
  - Crear una cita → `POST /appointments/create`
  - Consultar puntos del cliente → `GET /clients/:id/points`
  - Ver haircuts recomendados por forma de rostro → `GET /haircuts/FaceType/:faceType`
- Responde en español
- Mantiene historial de conversación en el contexto

**Stack específico:**
```js
// Backend: Node.js con @google/genai
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Function declarations para los endpoints del API
const tools = [{ functionDeclarations: [...] }];

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: conversationHistory,
  config: { tools, systemInstruction: SYSTEM_PROMPT }
});
```

### Módulo 2: Voz en tiempo real con Live API (Gemini 3.1 Flash Live)

**Arquitectura requerida** (NUNCA conectar directamente desde el browser, las credentials no deben estar en el cliente):

Browser (mic audio) → Backend Node.js (ws proxy) → Gemini Live API (WebSocket)

**Flujo técnico:**
1. El frontend captura audio del micrófono con `MediaRecorder` en formato `audio/pcm` (16-bit, 16kHz, mono)
2. Envía los chunks de audio via WebSocket al backend Node.js
3. El backend mantiene una sesión WebSocket persistente con `gemini-3.1-flash-live-preview`
4. El modelo responde con audio PCM16 a 24kHz
5. El backend retransmite ese audio al frontend
6. El frontend lo reproduce con `AudioContext.decodeAudioData()`

**Configuración del modelo:**
```js
// Usando el SDK @google/genai con Live API
const session = await ai.live.connect({
  model: "gemini-3.1-flash-live-preview",
  config: {
    responseModalities: ["AUDIO"],
    inputAudioTranscription: true,    // transcripción del usuario
    outputAudioTranscription: true,   // transcripción de la respuesta
    systemInstruction: {
      parts: [{ text: BARBER_ASSISTANT_PROMPT }]
    }
  }
});
```

**Features a implementar:**
- Barge-in (interrumpir al modelo mientras habla)
- Mostrar transcripción en pantalla mientras se habla
- Indicador visual de estado: `idle | listening | thinking | speaking`
- Cambiar entre modo chat de texto y modo llamada de voz
- El asistente de voz también tiene acceso a los tools de los endpoints (function calling en Live API)

### Módulo 3: Recomendación de haircuts por forma de rostro

Este módulo usa el endpoint local de TodoGemini:

POST http://localhost:3007/api/ai-haircut/analyze

Ese endpoint devuelve en su respuesta el atributo `faceSummary.faceShape` con uno de estos valores: OVALADO, CUADRADO, REDONDO, CORAZÓN, CUALQUIERA, TRIANGULAR.

Flujo:
1. El frontend de TodoGemini llama a /api/ai-haircut/analyze (o /api/vision/recommend) con la foto del cliente
2. De la respuesta extrae el campo `faceSummary.faceShape`
3. (Opcional) Con ese valor hace un GET al endpoint de HaircutFiveFriends:
  http://localhost:3006/HaircutFiveFriends/api/v1/haircuts/FaceType/:faceType
4. Muestra al cliente los haircuts recomendados para su forma de rostro,
  con sus imágenes de Cloudinary

La lógica de IA vive en TodoGemini y ya está encapsulada en /api/ai-haircut/analyze.

### Módulo 4: Análisis de reseñas con IA

- Agrupa las reseñas por barbero (vía `GET /review/barbero/:id`)
- Gemini 2.5 Flash analiza el sentimiento, temas recurrentes y genera un reporte de insights
- El barbero ve un resumen: puntos fuertes, áreas de mejora, tendencias

---

## PROYECTO 2 — HaircutAR (Python)

Proyecto completamente separado de los anteriores (no es parte de los 2 proyectos base ni de TodoGemini).

### ¿Qué hace?

Filtro de realidad aumentada en tiempo real: muestra la cámara del usuario con una imagen de un corte de cabello superpuesta en la cabeza, para que el cliente pueda "probar" cómo se vería el corte antes de pedirlo.

La imagen base del corte viene del endpoint que ya existe: `src/aiHaircut/aiHaircut.routes.js` en TodoGemini.

### Stack técnico

- **Python 3.10+**
- **OpenCV** (`cv2`) — captura de cámara, renderizado, overlay de imagen con canal alpha
- **MediaPipe** (`mediapipe`) — Face Mesh con 468 landmarks 3D para detección de cabeza y puntos de referencia
- **NumPy** — transformaciones de matrices para alinear el overlay
- **FastAPI** — servidor HTTP + WebSocket para servir el stream procesado al browser
- **uvicorn** — ASGI server para FastAPI
- **requests** — para obtener las imágenes de haircuts desde el API de HaircutFiveFriends
- **python-multipart** — para recibir imágenes desde el frontend si fuera necesario

### Cómo funciona técnicamente

1. FastAPI expone un endpoint WebSocket (`/ws/camera`) o un MJPEG stream (`/video-feed`)
2. En el servidor Python, OpenCV captura la webcam (`cv2.VideoCapture(0)`)
3. Por cada frame, MediaPipe Face Mesh detecta los 468 landmarks faciales
4. Se usan los landmarks de la zona del pelo/cabeza (puntos de la frente y crown) para calcular:
   - Posición del centro de la cabeza
   - Escala (distancia entre sienes)
   - Rotación (ángulo de la cabeza en 2D)
5. La imagen PNG del corte (con canal alpha transparente) se transforma con `cv2.warpAffine()` para alinearse sobre la cabeza
6. Se hace el overlay sobre el frame usando el canal alpha como máscara
7. El frame resultante se codifica como JPEG y se envía al browser via MJPEG o WebSocket

### Endpoints de FastAPI

- **GET** /UI básica HTML (para testing local)
- **GET** /video-feed -MJPEG stream con el overlay aplicado
- **GET** /haircuts — Proxy al endpoint de HaircutFiveFriends para listar haircuts
- **POST** /select-haircut — Seleccionar qué imagen de corte usar como overlay
- **WS** /ws/camera — WebSocket alternativo para streaming bidireccional

### Ejemplo de estructura del proyecto HaircutAR
 -**HaircutAR/
	├── main.py              # FastAPI app + MJPEG/WebSocket endpoint
	├── ar_engine.py         # Lógica de MediaPipe + OpenCV overlay
	├── haircut_fetcher.py   # Fetch de imágenes desde HaircutFiveFriends API
	├── requirements.txt
	└── assets/
	└── default_haircut.png

### requirements.txt
- fastapi==0.115.x
- uvicorn[standard]==0.30.x
- opencv-python==4.10.x
- mediapipe==0.10.x
- numpy==1.26.x
- requests==2.32.x
- python-multipart==0.0.x
- websockets==12.x

---

## IDEAS ADICIONALES SUGERIDAS

### Para TodoGemini:
1. **Gemini con Google Search grounding**: El asistente puede responder preguntas sobre tendencias de cortes consultando la web en tiempo real (`tools: [{ googleSearch: {} }]`)
2. **Modo "consulta exprés"**: El usuario describe su estilo en voz, el asistente sugiere servicio + barbero + horario y agenda directamente usando function calling
3. **Lyria RealTime**: Música de ambiente en la sala de espera generada por IA con prompts de texto (disponible via WebSocket en Gemini API)
4. **Resumen automático de estadísticas**: Gemini lee el PDF de estadísticas y lo resume en lenguaje natural para el admin

### Para HaircutAR:
1. **Hair segmentation de MediaPipe** (`mp.solutions.selfie_segmentation`): Además del overlay, segmentar el cabello actual del usuario para hacer una comparación lado a lado
2. **Selección por forma de rostro**: Si el módulo de visión de TodoGemini ya detectó la forma del rostro, HaircutAR puede filtrar y mostrar automáticamente solo los cortes recomendados para ese rostro
3. **Ajuste de opacidad**: Slider para que el usuario controle qué tan "fuerte" se ve el overlay (0 = solo cámara, 1 = overlay completo)
4. **Captura de foto**: Botón para tomar foto del resultado y enviarlo al chatbot de Gemini para análisis adicional

---

## NOTAS IMPORTANTES

- El modelo `gemini-3.1-flash-live-preview` es el recomendado para Live API (los modelos `gemini-2.5-flash-native-audio-*` están deprecated en 2026)
- Usar SIEMPRE el SDK `@google/genai` (no el deprecated `@google/generative-ai`)  
- El proxy backend para Live API es obligatorio en producción para no exponer la API key
- Las vistas React de HaircutFiveFriends y AuthService son proyectos separados — NO incluir esas vistas aquí
- HaircutAR es un proyecto Python independiente, no una ruta dentro de TodoGemini