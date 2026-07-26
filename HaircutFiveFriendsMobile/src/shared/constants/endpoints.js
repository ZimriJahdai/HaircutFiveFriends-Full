// URLs base leídas de variables EXPO_PUBLIC_* (.env) con fallback a localhost.
// En dispositivo físico SIEMPRE usar la IP LAN del backend (no localhost).
// El emulador de Android usa 10.0.2.2 en lugar de localhost.

const resolveUrl = (preferred, fallback) => {
  const value = preferred;
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

export const ENDPOINTS = {
  AUTH: resolveUrl(process.env.EXPO_PUBLIC_AUTH_URL, 'http://localhost:3005/api/v1'),
  API: resolveUrl(process.env.EXPO_PUBLIC_API_URL, 'http://localhost:3006/HaircutFiveFriends/api/v1'),
};
