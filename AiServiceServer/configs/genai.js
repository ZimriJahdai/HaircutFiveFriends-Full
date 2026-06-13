import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// -- Configuracion central de Gemini / Vertex AI (ADC) ------------------------
// Un unico punto para: el cliente GoogleGenAI (singleton), los modelos y la
// validacion de entorno. Importar este modulo NO lanza errores: la validacion
// se ejecuta en el bootstrap del servidor (ver validateGenaiEnv).

export const GCP_PROJECT =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID;
export const GCP_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION ||
  process.env.GOOGLE_VERTEX_LOCATION ||
  "us-central1";

// Timeout (ms) para las llamadas a Gemini. Soportado por @google/genai via httpOptions.
const GENAI_TIMEOUT_MS = Number(process.env.GENAI_TIMEOUT_MS) || 30000;

// Modelos centralizados. El .env manda; los defaults usan IDs estables de Vertex AI.
// Nota: el SDK @google/genai v1.50.1 selecciona Vertex AI con `vertexai: true`
// + project + location. NO existe opcion `enterprise`; GOOGLE_GENAI_USE_ENTERPRISE
// no es leida por el SDK (variable muerta, conservada solo por compatibilidad).
export const MODELS = {
  // Chatbot de texto y analisis de reseñas
  TEXT: process.env.VERTEX_TEXT_MODEL || "gemini-3.1-flash-lite",
  // Analisis multimodal del rostro (describeFace) — distinto del chatbot
  VISION: process.env.VERTEX_VISION_MODEL || "gemini-3.5-flash",
  // Generacion de la imagen del corte
  IMAGE:
    process.env.GEMINI_IMAGE_MODEL ||
    process.env.VERTEX_IMAGE_MODEL ||
    "gemini-3-pro-image-preview",
  LIVE: process.env.VERTEX_LIVE_MODEL || "gemini-3.1-flash-live",
};

// Singleton perezoso: se crea en el primer uso real, no al importar el modulo.
let _genai = null;

/**
 * Devuelve el cliente GoogleGenAI compartido (Vertex AI + ADC).
 * Se instancia una sola vez para todo el servidor.
 */
export const getGenAI = () => {
  if (_genai) return _genai;
  _genai = new GoogleGenAI({
    vertexai: true,
    project: GCP_PROJECT,
    location: GCP_LOCATION,
    httpOptions: { timeout: GENAI_TIMEOUT_MS },
  });
  return _genai;
};

/**
 * Valida las variables de entorno minimas para usar Vertex AI con ADC.
 * Debe llamarse en el bootstrap del servidor (no como side-effect de import).
 * @returns {string[]} lista de variables faltantes (vacia si todo OK)
 */
export const validateGenaiEnv = () => {
  const missing = [];
  if (!GCP_PROJECT) missing.push("GOOGLE_CLOUD_PROJECT (o GOOGLE_PROJECT_ID)");
  return missing;
};
