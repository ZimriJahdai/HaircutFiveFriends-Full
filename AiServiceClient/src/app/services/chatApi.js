import { CHAT_API_URL } from '../constants/chat.js';
import { handleUnauthorized } from '../utils/handleAuthError.js';

export const fetchHistory = async ({ userId, token }) => {
  const response = await fetch(`${CHAT_API_URL}/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (handleUnauthorized(response)) {
    throw new Error('Sesion expirada. Inicia sesion nuevamente.');
  }
  if (!response.ok) {
    throw new Error('Error al cargar historial.');
  }
  return response.json();
};

export const sendChatMessage = async ({ userId, input, token }) => {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, input }),
  });

  if (handleUnauthorized(response)) {
    throw new Error('Sesion expirada. Inicia sesion nuevamente.');
  }

  if (!response.ok) {
    throw new Error('Error al enviar mensaje.');
  }

  return response.json();
};

export const clearChatHistory = async ({ userId, token }) => {
  const response = await fetch(`${CHAT_API_URL}/${userId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (handleUnauthorized(response)) {
    throw new Error('Sesion expirada. Inicia sesion nuevamente.');
  }

  if (!response.ok) {
    throw new Error('Error al limpiar historial.');
  }
};
