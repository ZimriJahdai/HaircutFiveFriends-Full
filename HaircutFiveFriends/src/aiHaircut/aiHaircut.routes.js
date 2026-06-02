'use strict';

import { Router } from "express";
import multer from "multer";
import { analyzeFace } from "./aiHaircut.controller.js";
import { validateJWT, authorizeRoles } from "../../middlewares/validate-JWT.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * POST /HaircutFiveFriends/api/v1/ai-haircut/analyze
 *
 * Envío como multipart/form-data:
 *   - image (file, opcional)       — foto del cliente
 *   - imageBase64 (text, opcional) — foto en base64 si no se sube archivo
 *   - mimeType (text, opcional)    — "image/jpeg" | "image/png"  (default: image/jpeg)
 *   - haircutName (text, opcional) — nombre del corte deseado
 *   - description (text, opcional) — descripción libre del corte
 *   - length (text, opcional)      — "short" | "medium" | "long"
 *   - style (text, opcional)       — "classic" | "modern" | "urban"
 *
 * También acepta application/json con los mismos campos (sin "image").
 */
router.post(
  "/analyze",
  validateJWT,
  authorizeRoles('ADMIN_ROLE', 'USER_ROLE', 'EMPLOYEE_ROLE'),
  upload.single("image"),
  analyzeFace
);

export default router;