import axios from 'axios';

import { ENDPOINTS } from '../constants/endpoints';
import { useAuthStore } from '../store/authStore';

// Cliente de AuthService-The5FadeFriends (:3005/api/v1): login, registro,
// verificación, recuperación de contraseña, perfil.
const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  timeout: 8000,
});

// Solo Authorization (no x-token): el CORS de los backends únicamente permite
// Content-Type/Authorization, y un header custom no listado rompe el preflight
// en web con "Network Error" aunque el backend acepte el token perfectamente.
authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// En 401 cerramos sesión: no existe endpoint de refresh-token en el backend.
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout('session-expired');
    }
    error.readableMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Ocurrió un error de red';
    return Promise.reject(error);
  }
);

export default authClient;
