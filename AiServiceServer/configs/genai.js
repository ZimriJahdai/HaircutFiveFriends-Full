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

// Region por modelo. Los Gemini 3.x preview (TEXT) corren en el endpoint
// `global`; el LIVE native-audio y el resto siguen en us-central1 (GCP_LOCATION).
export const LOCATIONS = {
  TEXT: process.env.VERTEX_TEXT_LOCATION || "global",
};

// Timeout (ms) para las llamadas a Gemini. Soportado por @google/genai via httpOptions.
const GENAI_TIMEOUT_MS = Number(process.env.GENAI_TIMEOUT_MS) || 30000;

// Modelos centralizados. El .env manda; los defaults usan IDs estables de Vertex AI.
// Nota: el SDK @google/genai v1.50.1 selecciona Vertex AI con `vertexai: true`
// + project + location. NO existe opcion `enterprise`; GOOGLE_GENAI_USE_ENTERPRISE
// no es leida por el SDK (variable muerta, conservada solo por compatibilidad).
export const MODELS = {
  // Chatbot de texto y analisis de reseñas
  TEXT: process.env.VERTEX_TEXT_MODEL || "gemini-3.1-flash-lite-preview",
  // Analisis multimodal del rostro (describeFace) — distinto del chatbot
  VISION: process.env.VERTEX_VISION_MODEL || "gemini-3.5-flash",
  // Generacion de la imagen del corte
  IMAGE:
    process.env.GEMINI_IMAGE_MODEL ||
    process.env.VERTEX_IMAGE_MODEL ||
    "gemini-3-pro-image-preview",
  LIVE: process.env.VERTEX_LIVE_MODEL || "gemini-live-2.5-flash-native-audio",
  // Resumen barato de las respuestas de voz para persistir historial sin
  // inflar tokens del Live. Modelo ligero y rapido.
  SUMMARY: process.env.VERTEX_SUMMARY_MODEL || "gemini-2.5-flash-lite",
};

// Singletons perezosos cacheados por region. Cada region = un cliente Vertex,
// porque `location` se fija al construir GoogleGenAI y no se puede cambiar por
// llamada. Permite usar `global` (TEXT 3.x) y `us-central1` (LIVE) a la vez.
const _clients = new Map();

/**
 * Devuelve el cliente GoogleGenAI para una region (Vertex AI + ADC).
 * Se instancia uno por region y se reutiliza. Sin argumento usa GCP_LOCATION.
 * @param {string} [location] region Vertex (ej. "global", "us-central1")
 */
export const getGenAI = (location = GCP_LOCATION) => {
  if (_clients.has(location)) return _clients.get(location);
  const client = new GoogleGenAI({
    vertexai: true,
    project: GCP_PROJECT,
    location,
    httpOptions: { timeout: GENAI_TIMEOUT_MS },
  });
  _clients.set(location, client);
  return client;
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
