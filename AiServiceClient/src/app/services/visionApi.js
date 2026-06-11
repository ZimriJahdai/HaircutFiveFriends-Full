import { VISION_API_URL } from '../constants/vision.js';
import { handleUnauthorized } from '../utils/handleAuthError.js';

export const recommendHaircuts = async ({
  imageBase64,
  mimeType,
  token,
  haircutName,
  description,
  length,
  style,
}) => {
  const response = await fetch(`${VISION_API_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}`, 'x-token': token } : {}),
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      haircutName,
      description,
      length,
      style,
    }),
  });

  if (handleUnauthorized(response)) {
    throw new Error('Sesion expirada. Inicia sesion nuevamente.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Error al procesar la imagen.');
  }

  return response.json();
};
