import { AR_BASE_URL } from '../constants/ar.js';

export const sendOverlayToAr = async ({ imageBase64, mimeType, faceSummary }) => {
  const response = await fetch(`${AR_BASE_URL}/select-haircut-base64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, faceSummary }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'No se pudo enviar la imagen al modulo AR.');
  }

  return response.json();
};
