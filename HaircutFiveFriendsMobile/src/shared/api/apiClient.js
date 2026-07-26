import axios from 'axios';

import { ENDPOINTS } from '../constants/endpoints';
import { useAuthStore } from '../store/authStore';

// Cliente de HaircutFiveFriends (:3006/HaircutFiveFriends/api/v1): clientes,
// barberos, servicios, productos, ventas, citas, favoritos, reseñas, facturas.
const apiClient = axios.create({
  baseURL: ENDPOINTS.API,
  timeout: 15000,
});

// Solo Authorization (no x-token): el CORS de los backends únicamente permite
// Content-Type/Authorization, y un header custom no listado rompe el preflight
// en web con "Network Error" aunque el backend acepte el token perfectamente.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
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

export default apiClient;
