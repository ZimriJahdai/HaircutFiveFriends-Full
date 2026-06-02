import { Base64ImageService } from "../../services/base64ImageService.js";

export async function previewImage(req, res, next) {
  try {
    const { imageBase64, mimeType = "image/png" } = req.body;
    if (!imageBase64) return res.status(400).json({ message: "imageBase64 es requerido" });
    const buffer = Base64ImageService.toBuffer(imageBase64);
    res.set("Content-Type", mimeType);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

export async function saveImage(req, res, next) {
  try {
    const { images } = req.body;

    // Soportar modo legacy de una sola imagen
    if (!images) {
      const { imageBase64, mimeType = "image/png", filename = "preview.png" } = req.body;
      if (!imageBase64) return res.status(400).json({ message: "imageBase64 es requerido" });
      const { filePath } = await Base64ImageService.saveToTemp({ base64: imageBase64, mimeType, filename });
      return res.status(201).json({ files: [{ filePath, mimeType, filename }] });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "images debe ser un array con al menos un elemento" });
    }

    const files = await Base64ImageService.saveManyToTemp(images);
    res.status(201).json({ files });
  } catch (err) {
    next(err);
  }
}
