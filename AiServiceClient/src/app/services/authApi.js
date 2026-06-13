import { CHAT_API_URL } from '../constants/chat.js';

const AUTH_API_URL = CHAT_API_URL.replace('/api/chat', '/api/auth');

export const login = async ({ email, password, signal }) => {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Error al iniciar sesion.');
  }

  return response.json();
};
