import pkg from "@google-cloud/vertexai";
const { VertexAI } = pkg;

import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

// -- Configuracion ------------------------------------------------------------
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID || "project-4be61ab3-b84b-41d6-bf6";
const GOOGLE_VERTEX_LOCATION = process.env.GOOGLE_VERTEX_LOCATION || "us-central1";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDfaMghcRlRhTk4N50xd5jvaDQva8Wg3Zk";

if (!GOOGLE_PROJECT_ID) throw new Error("Falta GOOGLE_PROJECT_ID en el entorno");
if (!GEMINI_API_KEY) throw new Error("Falta GEMINI_API_KEY en el entorno");

const TEXT_MODEL = process.env.VERTEX_TEXT_MODEL || "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";

// Cliente Vertex AI - para describeFace
const vertex = new VertexAI({
  project: GOOGLE_PROJECT_ID,
  location: GOOGLE_VERTEX_LOCATION,
});

// Cliente Gemini AI Studio - para edicion de imagen
const geminiAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// -- Helpers ------------------------------------------------------------------
function sanitizeBase64(b64) {
  if (!b64) return b64;
  const idx = b64.indexOf(",");
  if (b64.startsWith("data:") && idx !== -1) return b64.slice(idx + 1);
  return b64.replace(/\s+/g, "");
}

function extractJsonFromText(text) {
  if (!text) return null;

  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return null;
}

function toStructuredFaceSummary(rawText) {
  const empty = {
    faceShape: null,
    hairTexture: null,
    hairColor: null,
    facialLines: null,
    recommendedHaircutStyle: null,
  };

  const jsonCandidate = extractJsonFromText(rawText);
  if (!jsonCandidate) return empty;

  try {
    const parsed = JSON.parse(jsonCandidate);
    return {
      faceShape: parsed.faceShape ?? parsed.formaCara ?? null,
      hairTexture: parsed.hairTexture ?? parsed.texturaCabello ?? null,
      hairColor: parsed.hairColor ?? parsed.colorCabello ?? null,
      facialLines: parsed.facialLines ?? parsed.lineasFaciales ?? null,
      recommendedHaircutStyle:
        parsed.recommendedHaircutStyle ?? parsed.estiloCorteRecomendado ?? null,
    };
  } catch {
    return empty;
  }
}

function faceSummaryForPrompt(faceSummary) {
  if (!faceSummary) return "No face analysis available.";
  if (typeof faceSummary === "string") return faceSummary;

  const {
    faceShape,
    hairTexture,
    hairColor,
    facialLines,
    recommendedHaircutStyle,
  } = faceSummary;

  return [
    `face shape: ${faceShape || "unknown"}`,
    `hair texture: ${hairTexture || "unknown"}`,
    `hair color: ${hairColor || "unknown"}`,
    `facial lines: ${facialLines || "unknown"}`,
    `recommended haircut style: ${recommendedHaircutStyle || "unknown"}`,
  ].join(", ");
}

async function generateWithRetry(fn, { retries = 3, baseDelayMs = 1000 } = {}) {
  let attempt = 0;
  const retriableCodes = new Set([429, 503]);
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const code = err?.code || err?.status;
      const isRetriable =
        retriableCodes.has(Number(code)) || retriableCodes.has(code);
      if (!isRetriable || attempt >= retries) {
        err._attempt = attempt;
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((res) => setTimeout(res, delay));
      attempt += 1;
    }
  }
}

async function loadImageAsBase64FromPath(imagePath) {
  const file = await fs.readFile(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return { base64: file.toString("base64"), mime };
}

/**
 * Construye el prompt de edicion a partir de los parametros del corte.
 * Todos los campos son opcionales - si no se pasan se usa un fade moderno por defecto.
 *
 * @param {string} faceSummary   - Analisis del rostro devuelto por describeFace
 * @param {object} haircutOptions
 * @param {string} [haircutOptions.haircutName]   - Nombre del corte (ej: "undercut", "pompadour")
 * @param {string} [haircutOptions.description]   - Descripcion libre del corte deseado
 * @param {string} [haircutOptions.length]        - Largo: "short" | "medium" | "long"
 * @param {string} [haircutOptions.style]         - Estilo: "classic" | "modern" | "urban"
 */
function buildHaircutPrompt(faceSummary, haircutOptions = {}) {
  const { haircutName, description, length, style } = haircutOptions;
  const faceSummaryText = faceSummaryForPrompt(faceSummary);

  const haircutParts = [];

  if (haircutName) haircutParts.push(`haircut name: ${haircutName}`);
  if (description) haircutParts.push(`description: ${description}`);
  if (length) haircutParts.push(`length: ${length}`);
  if (style) haircutParts.push(`style: ${style}`);

  const haircutSpec =
    haircutParts.length > 0
      ? haircutParts.join(", ")
      : "modern fade haircut (short sides with skin fade, slightly longer on top)";

  return (
    `You are a professional photo editor for a barbershop. ` +
    `Edit ONLY the hairstyle of the person in this photo. ` +
    `Apply the following haircut - ${haircutSpec}. ` +
    `Make the result hyper-realistic, as if done by a professional barber. ` +
    `Do NOT generate new hair, facial hair, body hair, or extra strands that were not present in the original image. ` +
    `Only reshape, trim, fade, or restyle the person's existing scalp hair according to the requested haircut. ` +
    `STRICTLY PRESERVE: face identity, skin tone, facial structure, eye color, ` +
    `eyebrows, beard, mustache, background, lighting and clothing. ` +
    `Do NOT alter anything except the hair on top of the head and sides. ` +
    `If any text is returned, write it in plain Spanish with no markdown. ` +
    `Face analysis for reference: ${faceSummaryText}.`
  );
}

// -- describeFace (Gemini API via Fetch) --------------------------------------
export async function describeFace({ imageBase64, imagePath, mimeType }) {
  const hasPath = Boolean(imagePath);
  const { base64, mime } = hasPath
    ? await loadImageAsBase64FromPath(imagePath)
    : { base64: sanitizeBase64(imageBase64), mime: mimeType || "image/jpeg" };

  if (!base64) throw new Error("No se proporciono imagen en base64");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [{
      parts: [
        { text: "Analiza el rostro y responde SOLO con un JSON valido (sin markdown ni texto extra) con estas claves exactas: faceShape, hairTexture, hairColor, facialLines, recommendedHaircutStyle. Cada valor debe ser una frase breve en espanol." },
        { inlineData: { data: base64, mimeType: mime } }
      ]
    }]
  };

  const response = await generateWithRetry(async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
    }
    return res.json();
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const rawText = parts.map((p) => p.text).filter(Boolean).join(" ");
  return toStructuredFaceSummary(rawText);
}

// -- proposeHaircutImage (Gemini API via Fetch) -------------------------------
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [{
      parts: [
        { inlineData: { data: base64, mimeType: mime } },
        { text: editPrompt }
      ]
    }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"]
    }
  };

  const response = await generateWithRetry(async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
    }
    return res.json();
  });

  const rawCandidate = response.candidates?.[0];
  const parts = rawCandidate?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);

  if (!imagePart) {
    const textParts = parts.filter((p) => p.text).map((p) => p.text).join(" ");
    throw new Error(`Gemini no devolvio una imagen. Motivo: ${textParts || "Desconocido"}`);
  }

  return imagePart.inlineData.data;
}

