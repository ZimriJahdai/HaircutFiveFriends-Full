import { Modality } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { getGenAI, MODELS } from "../configs/genai.js";

// Cliente y modelos centralizados en configs/genai.js (singleton + ADC).
// describeFace usa el modelo de VISION (distinto del chatbot/texto).
const VISION_MODEL = MODELS.VISION;
const GEMINI_IMAGE_MODEL = MODELS.IMAGE;
const SUMMARY_MODEL = MODELS.SUMMARY;

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

// -- summarizeAssistantReply --------------------------------------------------
/**
 * Resume en una frase la respuesta hablada del asistente, para guardarla en el
 * historial sin gastar muchos tokens del Live. Usa el modelo SUMMARY (ligero).
 * Si falla o el texto es vacio, devuelve cadena vacia (el llamador decide).
 *
 * @param {string} text - Transcripcion de la respuesta del asistente.
 * @returns {Promise<string>} Resumen breve en espanol (o '' si no hay nada).
 */
export async function summarizeAssistantReply(text) {
  const clean = (text || "").trim();
  if (!clean) return "";

  const response = await generateWithRetry(async () => {
    return await getGenAI().models.generateContent({
      model: SUMMARY_MODEL,
      contents: [
        "Resume en una sola frase breve, en espanol, esta respuesta del " +
          "asistente de HaircutFiveFriends. Devuelve SOLO el resumen, sin " +
          "preambulo ni comillas:\n\n" +
          clean,
      ],
    });
  });

  return (response.text || "").trim();
}

// -- describeFace (Gemini API via SDK en Vertex AI) --------------------------
export async function describeFace({ imageBase64, imagePath, mimeType }) {
  const hasPath = Boolean(imagePath);
  const { base64, mime } = hasPath
    ? await loadImageAsBase64FromPath(imagePath)
    : { base64: sanitizeBase64(imageBase64), mime: mimeType || "image/jpeg" };

  if (!base64) throw new Error("No se proporciono imagen en base64");

  const response = await generateWithRetry(async () => {
    return await getGenAI().models.generateContent({
      model: VISION_MODEL,
      contents: [
        "Analiza el rostro y responde SOLO con un JSON valido (sin markdown ni texto extra) con estas claves exactas: faceShape, hairTexture, hairColor, facialLines, recommendedHaircutStyle. Cada valor debe ser una frase breve en espanol.",
        { inlineData: { data: base64, mimeType: mime } }
      ]
    });
  });

  const rawText = response.text;
  return toStructuredFaceSummary(rawText);
}

// -- proposeHaircutImage (Gemini API via SDK en Vertex AI) --------------------
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

  const response = await generateWithRetry(async () => {
    return await getGenAI().models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: [
        { inlineData: { data: base64, mimeType: mime } },
        editPrompt
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE]
      }
    });
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);

  if (!imagePart) {
    const textParts = parts.filter((p) => p.text).map((p) => p.text).join(" ");
    throw new Error(`Gemini no devolvio una imagen. Motivo: ${textParts || "Desconocido"}`);
  }

  return imagePart.inlineData.data;
}
