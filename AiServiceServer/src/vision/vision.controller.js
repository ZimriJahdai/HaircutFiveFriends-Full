import { describeFace, proposeHaircutImage } from '../../services/genaiService.js';

const sanitizeBase64 = (value) => {
  if (!value) return value;
  const trimmed = String(value).trim();
  const index = trimmed.indexOf(',');
  if (trimmed.startsWith('data:') && index !== -1) {
    return trimmed.slice(index + 1);
  }
  return trimmed.replace(/\s+/g, '');
};

const normalizeFaceShape = (value) => {
  if (!value) return null;
  const text = String(value).toLowerCase();

  if (text.includes('oval')) return 'OVALADO';
  if (text.includes('cuadr')) return 'CUADRADO';
  if (text.includes('redond')) return 'REDONDO';
  if (text.includes('corazon') || text.includes('heart')) return 'CORAZON';
  if (text.includes('triang')) return 'TRIANGULAR';

  return 'CUALQUIERA';
};

export const recommendHaircut = async (req, res) => {
  try {
    const { image, imageBase64, mimeType, haircutName, description, length, style } = req.body;
    const base64 = sanitizeBase64(imageBase64 || image);

    if (!base64) {
      return res.status(400).json({ error: 'No se proporciono ninguna imagen.' });
    }

    const faceSummary = await describeFace({ imageBase64: base64, mimeType });
    const haircutImageBase64 = await proposeHaircutImage(faceSummary, {
      imageBase64: base64,
      mimeType,
      haircutName,
      description,
      length,
      style,
    });

    const faceShapeRaw = faceSummary?.faceShape;
    const faceShape = normalizeFaceShape(faceShapeRaw);

    return res.json({
      faceShape,
      faceSummary,
      haircutImageBase64,
      recommendations: []
    });
  } catch (error) {
    console.error('Error en recomendacion facial:', error?.message || error);
    return res.status(500).json({
      error: 'Error al procesar la imagen facial.'
    });
  }
};
