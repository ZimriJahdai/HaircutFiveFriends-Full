'use strict';

import { describeFace, proposeHaircutImage } from "../../services/genaiService.js";

const FALLBACK_MIME = "image/jpeg";

function normalizeMimeType(mime) {
  if (!mime || mime === "application/octet-stream") return FALLBACK_MIME;
  return mime;
}

function sanitizeBase64(b64) {
  if (!b64) return b64;
  const idx = b64.indexOf(",");
  if (b64.startsWith("data:") && idx !== -1) b64 = b64.slice(idx + 1);
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64)) return undefined;
  return b64.replace(/\s+/g, "");
}

/**
 * POST /HaircutFiveFriends/api/v1/ai-haircut/analyze
 *
 * Acepta:
 *   - multipart/form-data con campo "image" (archivo) O campo "imageBase64" (string)
 *   - application/json con campos "imageBase64" y "mimeType"
 *
 * Campos opcionales para personalizar el corte:
 *   - haircutName   : nombre del corte (ej: "undercut", "pompadour")
 *   - description   : descripción libre del corte deseado
 *   - length        : "short" | "medium" | "long"
 *   - style         : "classic" | "modern" | "urban"
 *
 * Respuesta:
 *   {
 *     faceSummary       : string  — análisis del rostro
 *     haircutImageBase64: string  — imagen generada en base64
 *     haircutParams     : object  — parámetros usados
 *   }
 */
export async function analyzeFace(req, res, next) {
  try {
    const {
      imageBase64,
      imagePath,
      mimeType,
      haircutName,
      description,
      length,
      style,
    } = req.body || {};

    const file = req.file;

    const resolvedImageBase64 = file
      ? file.buffer.toString("base64")
      : imageBase64;
    const resolvedMimeType = normalizeMimeType(file ? file.mimetype : mimeType);

    const cleanBase64 = resolvedImageBase64
      ? sanitizeBase64(resolvedImageBase64)
      : undefined;

    if (resolvedImageBase64 && !cleanBase64) {
      return res.status(400).json({
        success: false,
        message: "imageBase64 no es válido",
      });
    }

    if (cleanBase64 && cleanBase64.length < 64) {
      return res.status(400).json({
        success: false,
        message: "imageBase64 demasiado corto",
      });
    }

    if (!resolvedImageBase64 && !imagePath) {
      return res.status(400).json({
        success: false,
        message: "Proporciona una imagen (file, imageBase64 o imagePath)",
      });
    }

    const faceSummary = await describeFace({
      imageBase64: cleanBase64,
      imagePath,
      mimeType: resolvedMimeType,
    });

    const haircutImageBase64 = await proposeHaircutImage(faceSummary, {
      imageBase64: cleanBase64,
      imagePath,
      mimeType: resolvedMimeType,
      haircutName,
      description,
      length,
      style,
    });

    return res.status(200).json({
      success: true,
      faceSummary,
      haircutImageBase64,
      haircutParams: {
        haircutName: haircutName || null,
        description: description || null,
        length: length || null,
        style: style || null,
      },
    });
  } catch (err) {
    next(err);
  }
}