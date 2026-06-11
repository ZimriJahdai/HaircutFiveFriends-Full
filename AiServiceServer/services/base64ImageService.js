import fs from "fs/promises";
import path from "path";

export class Base64ImageService {
  static toBuffer(base64) {
    if (!base64) throw new Error("imageBase64 requerido");
    return Buffer.from(base64, "base64");
  }

  static async saveToTemp({ base64, mimeType = "image/png", filename = "preview.png" }) {
    const buffer = this.toBuffer(base64);
    const safeName = filename.replace(/[^\w.-]/g, "_");
    const tmpDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, safeName);
    await fs.writeFile(filePath, buffer);
    return { filePath, mimeType };
  }

  static async saveManyToTemp(images = []) {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error("Se requiere al menos una imagen para guardar");
    }

    const results = [];
    for (const image of images) {
      const { imageBase64, base64, mimeType = "image/png", filename = "image.png" } = image || {};
      const selectedBase64 = imageBase64 || base64;
      if (!selectedBase64) {
        throw new Error("Cada imagen debe incluir imageBase64");
      }
      const { filePath } = await this.saveToTemp({ base64: selectedBase64, mimeType, filename });
      results.push({ filePath, mimeType, filename });
    }
    return results;
  }
}
