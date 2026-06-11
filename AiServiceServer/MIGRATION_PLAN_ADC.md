# Plan de Migración de API Key a Application Default Credentials (ADC) en AiServiceServer

Este documento detalla el plan para actualizar el backend `AiServiceServer` del uso de **API Keys de Google AI Studio** (desarrollo rápido) a **Application Default Credentials (ADC) en Vertex AI** (entorno de producción seguro de Google Cloud).

---

## 1. Antecedentes y Objetivos

Actualmente, el proyecto utiliza la variable de entorno `GEMINI_API_KEY` para autenticar peticiones a través del endpoint de Google AI Studio (`generativelanguage.googleapis.com`). Esto se hace de dos formas:
1. **Llamadas Unarias (Texto e Imágenes):** Usando llamadas manuales `fetch` en `genaiService.js` o instanciando el SDK `@google/genai` con una API Key en `chatbot.js` y `reviews.controller.js`.
2. **Llamadas Live API (WebSockets):** Conectando de manera bidireccional a través de un WebSocket nativo pasándole la API Key en los parámetros de consulta (`?key=${apiKey}`).

### El Cambio a ADC y Vertex AI
Para usar ADC de manera nativa, se debe cambiar el proveedor (backend) al servicio de **Vertex AI** en Google Cloud Platform (GCP).
* Vertex AI **no soporta API Keys** en sus endpoints para el uso de modelos. En su lugar, requiere **Tokens de acceso OAuth 2.0 (Bearer Tokens)**.
* El SDK oficial unificado `@google/genai` soporta Vertex AI nativamente al inicializarlo con la opción `{ vertexai: true }`. Al hacerlo, busca credenciales de forma automática a través de la lógica estándar de ADC.
* Para conexiones WebSocket manuales (como en `live-api.js`), debemos generar un token de acceso dinámico mediante la librería oficial de autenticación de Google y enviarlo en las cabeceras del protocolo de WebSocket (`Authorization: Bearer <token>`).

---

## 2. Configuración del Entorno (ADC Local y Producción)

### ⚠️ Prerequisito Obligatorio: Habilitar la Vertex AI API en GCP
Antes de ejecutar cualquier paso local o de producción, la **Vertex AI API debe estar habilitada** en el proyecto de GCP y el proyecto debe tener **billing activo**. Sin esto, todas las llamadas fallarán con un error 403 independientemente de que las credenciales ADC sean correctas.

```bash
# Habilitar la Vertex AI API en el proyecto
gcloud services enable aiplatform.googleapis.com --project=TU_PROJECT_ID
```

También puedes habilitarla desde la consola de GCP en: **APIs & Services → Enable APIs → Vertex AI API**.

> **Nota:** Si el proyecto no tiene billing habilitado, el servidor de Vertex Live API cierra la conexión WebSocket inmediatamente con un error de policy 1008.

---

### Localmente (Desarrollo)
Para que las credenciales funcionen en tu máquina local sin necesidad de crear archivos de claves manuales (Service Account Keys), sigue estos pasos:

1. **Instalar Google Cloud CLI (gcloud):** Asegúrate de tener instalado el SDK de Google Cloud.
2. **Iniciar Sesión en gcloud:**
   ```bash
   gcloud auth login
   ```
3. **Autenticar Application Default Credentials (ADC):**
   ```bash
   gcloud auth application-default login
   ```
   *Esto generará un archivo JSON de credenciales locales que las librerías de Google detectarán automáticamente.*
4. **Configurar el proyecto de cuota (opcional pero recomendado para evitar errores de cuota):**
   ```bash
   gcloud auth application-default set-quota-project TU_PROJECT_ID
   ```

### En Producción (Cloud Run, GKE, App Engine)
No se requieren archivos de credenciales. La plataforma de GCP asocia automáticamente el Service Account del servicio para generar los tokens mediante el servidor de metadatos interno de Google. El SDK y las librerías lo detectarán sin intervención manual.

---

## 3. Actualización de Variables de Entorno (`.env`)

Reemplazaremos o complementaremos el archivo `.env` en `AiServiceServer/.env`.

```env
# --- Antes ---
# GEMINI_API_KEY=AIzaSy...

# --- Ahora (Configuración ADC / Vertex AI) ---
GOOGLE_CLOUD_PROJECT=tu-id-de-proyecto-gcp
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
```

### Variable de Entorno Alternativa: `GOOGLE_GENAI_USE_VERTEXAI`
El SDK `@google/genai` también puede activar el modo Vertex AI **completamente vía variables de entorno**, sin necesidad de pasar `{ vertexai: true, project, location }` en cada inicialización del cliente:

```env
GOOGLE_CLOUD_PROJECT=tu-id-de-proyecto-gcp
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
```

Con estas tres variables definidas, `new GoogleGenAI()` (sin argumentos) ya opera en modo Vertex AI con ADC. Esto puede simplificar los archivos que instancian el cliente en múltiples lugares (`chatbot.js`, `reviews.controller.js`), aunque en este plan se opta por la inicialización explícita para mayor claridad y control.

---

## 4. Plan de Refactorización de Código (Paso a Paso)

### Paso 4.1: Actualizar Dependencias en `package.json`
Dos cambios necesarios:

**1. Agregar `google-auth-library`** para generar tokens OAuth de forma asíncrona en el WebSocket manual:
```json
"dependencies": {
  "google-auth-library": "^9.15.0",
  ...
}
```

**2. Eliminar `@google-cloud/vertexai`** — el SDK antiguo que estaba en uso parcial en `genaiService.js`. Tras la migración queda completamente huérfano. Los SDKs `@google/generative_language` y `@google-cloud/vertexai` son iteraciones anteriores que ya no reciben features de Gemini 2.0+ y deben removerse para evitar confusión y conflictos de versión:
```bash
npm uninstall @google-cloud/vertexai
```

Verificar también que no queden imports de `@google-cloud/vertexai` en ningún archivo del proyecto tras la refactorización.

---

### Paso 4.2: Actualizar `AiServiceServer/services/genaiService.js`
Actualmente, este archivo realiza llamadas raw `fetch` usando la API Key en la URL. Refactorizaremos ambas funciones (`describeFace` y `proposeHaircutImage`) para usar el SDK unificado `@google/genai` inicializado en modo Vertex AI. Esto eliminará las URLs manuales y manejará ADC automáticamente.

**Código Refactorizado Sugerido:**

```javascript
import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

const GOOGLE_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID;
const GOOGLE_VERTEX_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || process.env.GOOGLE_VERTEX_LOCATION || "us-central1";

if (!GOOGLE_PROJECT_ID) throw new Error("Falta GOOGLE_CLOUD_PROJECT en el entorno");

const TEXT_MODEL = process.env.VERTEX_TEXT_MODEL || "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";

// Inicializar el SDK con Vertex AI y ADC de manera nativa
const ai = new GoogleGenAI({
  vertexai: true,
  project: GOOGLE_PROJECT_ID,
  location: GOOGLE_VERTEX_LOCATION,
});

// ... (se mantienen los helpers de formateo y sanitización) ...

export async function describeFace({ imageBase64, imagePath, mimeType }) {
  const hasPath = Boolean(imagePath);
  const { base64, mime } = hasPath
    ? await loadImageAsBase64FromPath(imagePath)
    : { base64: sanitizeBase64(imageBase64), mime: mimeType || "image/jpeg" };

  if (!base64) throw new Error("No se proporciono imagen en base64");

  // Llamada limpia usando el SDK con ADC
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      "Analiza el rostro y responde SOLO con un JSON valido (sin markdown ni texto extra) con estas claves exactas: faceShape, hairTexture, hairColor, facialLines, recommendedHaircutStyle. Cada valor debe ser una frase breve en espanol.",
      { inlineData: { data: base64, mimeType: mime } }
    ]
  });

  // Nota: Acceder a response.text como propiedad, NO método.
  const rawText = response.text; 
  return toStructuredFaceSummary(rawText);
}

export async function proposeHaircutImage(
  faceSummary,
  { imageBase64, imagePath, mimeType, haircutName, description, length, style } = {}
) {
  const hasPath = Boolean(imagePath);
  const { base64, mime } = hasPath
    ? await loadImageAsBase64FromPath(imagePath)
    : { base64: sanitizeBase64(imageBase64), mime: mimeType || "image/jpeg" };

  if (!base64) throw new Error("No se proporciono imagen para editar");

  const editPrompt = buildHaircutPrompt(faceSummary, { haircutName, description, length, style });

  // Llamada limpia usando el SDK con ADC y respuesta multimodal (Imagen)
  const response = await ai.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: [
      { inlineData: { data: base64, mimeType: mime } },
      editPrompt
    ],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE]
    }
  });

  // Extraer la parte que contiene la imagen generada
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);

  if (!imagePart) {
    const textParts = parts.filter((p) => p.text).map((p) => p.text).join(" ");
    throw new Error(`Gemini no devolvio una imagen. Motivo: ${textParts || "Desconocido"}`);
  }

  return imagePart.inlineData.data;
}
```

---

### Paso 4.3: Actualizar `AiServiceServer/src/ai/chatbot.js`
Actualizaremos la inicialización para habilitar Vertex AI en el SDK y eliminaremos la dependencia de `process.env.GEMINI_API_KEY`.

**Cambios en `chatbot.js`:**
```javascript
// --- Antes ---
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Ahora ---
const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
});
```

---

### Paso 4.4: Actualizar `AiServiceServer/src/reviews/reviews.controller.js`
Este archivo actualmente tiene código roto ya que utiliza métodos e invocaciones desactualizadas como `.getGenerativeModel()` y `result.response.text()` (que pertenecen al SDK antiguo `@google/generative-ai`), pero importa desde el nuevo `@google/genai`. Lo corregiremos y adaptaremos a ADC.

**Código Refactorizado Sugerido:**
```javascript
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

const BARBER_API_BASE = 'http://localhost:3006/HaircutFiveFriends/api/v1';

export const analyzeBarberReviews = async (req, res) => {
    try {
        const { barberId } = req.params;

        const reviewsRes = await axios.get(`${BARBER_API_BASE}/review/barbero/${barberId}`);
        const reviews = reviewsRes.data;

        if (!reviews || reviews.length === 0) {
            return res.json({ message: 'No hay reseñas suficientes para analizar.' });
        }

        const reviewsText = reviews.map(r => `- [${r.rating} estrellas]: ${r.comment}`).join('\n');
        
        // Inicializar con ADC y Vertex AI
        const ai = new GoogleGenAI({
            vertexai: true,
            project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID,
            location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
        });

        const prompt = `
            Analiza las siguientes reseñas de un barbero y genera un reporte de insights en español.
            Incluye:
            1. Sentimiento general.
            2. Temas recurrentes (lo que más gusta y lo que menos).
            3. Puntos fuertes.
            4. Áreas de mejora.
            5. Tendencias observadas.

            Reseñas:
            ${reviewsText}
        `;

        // Corrección de sintaxis del SDK: usar ai.models.generateContent directamente
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        // Corrección de acceso al texto de respuesta (propiedad .text, no método .text())
        const report = response.text;

        return res.json({
            barberId,
            reviewCount: reviews.length,
            analysis: report
        });

    } catch (error) {
        console.error('Error al analizar reseñas:', error.message);
        res.status(500).json({ error: 'Error al analizar las reseñas del barbero.' });
    }
};
```

---

### Paso 4.5: Actualizar `AiServiceServer/src/ai/live-api.js`
Este archivo requiere el cambio más importante para soportar WebSockets con Vertex AI de manera segura utilizando ADC.

1. **Obtención del Token de Acceso:** Usaremos `GoogleAuth` para firmar y obtener un access token dinámico cada vez que un cliente WebSocket se conecte.
2. **Endpoint Regional de Vertex AI:** Cambiaremos la URL al servidor de streaming de Vertex AI.
3. **Cabecera de Autorización:** Pasaremos el Token Bearer al iniciar la conexión del socket Gemini.
4. **Formato de Modelos de Vertex:** Vertex requiere que el nombre del modelo de setup apunte a la ruta de recursos completa del proyecto GCP.

> **⚠️ Nota sobre expiración del token:** Los Bearer tokens de ADC tienen una vida útil predeterminada de **1 hora**. Una sesión de Live API puede extenderse más allá de ese límite. El código propuesto obtiene el token una sola vez al inicio de cada conexión WebSocket; si las sesiones son cortas esto es suficiente, pero para sesiones largas se recomienda implementar renovación proactiva (por ejemplo, refrescar el token cada ~55 minutos o al detectar un error 401 del socket Gemini antes de reconectar).

> **⚠️ Nota sobre versión de API del WebSocket:** El endpoint propuesto usa `v1beta1` (`google.cloud.aiplatform.v1beta1.LlmBidiService`). Existe también la versión estable `v1` (`google.cloud.aiplatform.v1.LlmBidiService`). Se mantiene `v1beta1` porque algunas funcionalidades como **session resumption** solo están disponibles en la versión beta. Si no necesitas estas features, puedes migrar a `v1` para mayor estabilidad.

> **⚠️ Nota sobre el modelo en el setup:** En el código de ejemplo se usa `gemini-2.0-flash-exp` como placeholder, pero **debes mantener el mismo modelo que tienes actualmente** (`gemini-3.1-flash-live-preview` en tu `live-api.js` original) o su equivalente disponible en Vertex AI. No hagas downgrade silencioso del modelo al migrar.

**Código Refactorizado Sugerido:**

```javascript
import WebSocket from 'ws';
import { GoogleAuth } from 'google-auth-library'; // Importante para ADC
import { systemInstruction, barberTools } from './tools.js';
import { getVoiceMemory } from './voice-memory.js';
import { executeFunctionCall } from './barber-tools-executor.js';
import { Chat } from '../chats/chat.model.js';
import { getUserIdFromToken } from '../../middlewares/validate-JWT.js';

// GCP Configs
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID;

// Inicializador de Google Auth
const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

// URL WebSocket para Vertex AI
const buildVertexWsUrl = (loc) => (
    `wss://${loc}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`
);

// Formato de Modelo Completo para Vertex AI
const buildVertexModelPath = (proj, loc, modelId) => (
    `projects/${proj}/locations/${loc}/publishers/google/models/${modelId}`
);

const extractVoiceTranscripts = (payload) => {
    // ... (mantiene la misma lógica de extracción de texto) ...
};

const appendVoiceMessage = async (userId, role, text) => {
    // ... (mantiene la misma lógica de persistencia de mensajes) ...
};

export const setupLiveApi = (wss) => {
    wss.on('connection', async (ws) => {
        console.log('Cliente WebSocket conectado para Live API (Vertex ADC)');

        let accessToken = '';
        try {
            // Obtener el Token Bearer dinámicamente mediante ADC
            const authClient = await auth.getClient();
            const tokenResponse = await authClient.getAccessToken();
            accessToken = tokenResponse.token;
        } catch (authError) {
            console.error('[LiveAPI] Error obteniendo token de acceso ADC:', authError);
            ws.send(JSON.stringify({
                event: 'gemini_error',
                message: 'Error de autenticación ADC en el servidor.',
            }));
            ws.close();
            return;
        }

        if (!accessToken) {
            console.error('[LiveAPI] Token de acceso vacio');
            ws.close();
            return;
        }

        const wsUrl = buildVertexWsUrl(location);
        
        // Conectar a Vertex AI pasando las credenciales Bearer
        const geminiSocket = new WebSocket(wsUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        let setupReady = false;
        const pendingMessages = [];
        const memoryText = await getVoiceMemory();
        const combinedInstruction = memoryText
            ? `${systemInstruction}\n\nMemoria persistente:\n${memoryText}`
            : systemInstruction;
        let authToken = '';
        let userId = '';
        let lastUserTranscript = '';
        let lastModelTranscript = '';

        const sendSetup = () => {
            const setupMessage = {
                setup: {
                    // Nota: Vertex requiere la ruta completa del recurso para el modelo
                    model: buildVertexModelPath(projectId, location, 'gemini-2.0-flash-exp'), 
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                    },
                    systemInstruction: {
                        parts: [{ text: combinedInstruction }],
                    },
                    tools: barberTools,
                },
            };

            console.log('[LiveAPI] Setup enviado a Vertex AI');
            geminiSocket.send(JSON.stringify(setupMessage));
        };

        // ... (el resto del archivo mantiene el ruteo de eventos websocket exactamente igual) ...
```

---

## 5. Pruebas y Validación de la Migración

Para asegurar que todo funcione correctamente tras aplicar los cambios:

1. **Verificar ADC antes de arrancar el servidor:**
   * Confirma que las credenciales ADC están activas y apuntan al proyecto correcto:
     ```bash
     gcloud auth application-default print-access-token
     gcloud config get-value project
     ```
   * Si el primer comando devuelve un token (string largo) y el segundo devuelve tu `PROJECT_ID`, ADC está listo. Si falla, repite `gcloud auth application-default login` antes de continuar.
   * Asegúrate también de tener `GOOGLE_CLOUD_PROJECT` configurado en tu `.env`.

2. **Arrancar el Servidor:**
   * Corre `npm run dev` para iniciar `AiServiceServer`.
   * Verifica que no arroje errores de inicialización relacionados con el SDK.
   * Si ves en los logs algún mensaje como `Using API Key` o el SDK intenta conectar a `generativelanguage.googleapis.com` en lugar de `aiplatform.googleapis.com`, hay alguna inicialización que no migró correctamente.

3. **Prueba de Análisis Facial (DescribeFace/ProposeHaircut):**
   * Envía una petición `POST` al endpoint `/api/ai-haircut/analyze` utilizando un cliente HTTP (Postman/Curl) con una imagen de ejemplo.
   * Comprueba que se realice la llamada, el rostro sea analizado y devuelva el JSON de análisis y la imagen modificada.

4. **Prueba de Chatbot:**
   * Interactúa con el chatbot para verificar que procese los mensajes contextuales con herramientas correctamente y sin fallas de autenticación.

5. **Prueba de Live API (Streaming de Voz):**
   * Conéctate a través de WebSocket a la ruta correspondiente.
   * Verifica los logs de consola: debe mostrar `Cliente WebSocket conectado para Live API (Vertex ADC)` y `Setup enviado a Vertex AI`.
   * Verifica que la conversación por voz reciba respuestas de audio de vuelta fluidamente.
