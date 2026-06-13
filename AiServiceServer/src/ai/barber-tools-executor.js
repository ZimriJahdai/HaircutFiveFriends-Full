import axios from 'axios';

const API_BASE = 'http://localhost:3006/HaircutFiveFriends/api/v1';
const REQUEST_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS) || 15000;
const barberApi = axios.create({ baseURL: API_BASE, timeout: REQUEST_TIMEOUT_MS });

export const executeFunctionCall = async (call, token) => {
  const args = call?.args || {};
  console.log('[Tools] Ejecutando', call?.name, 'args:', args);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  try {
    switch (call?.name) {
      case 'get_services': {
        const svcRes = await barberApi.get('/service/obtener', { headers });
        return svcRes.data;
      }
      case 'get_barber_availability': {
        const availRes = await barberApi.get('/appointments/barber/', {
          params: {
            barber_id: args.barber_id,
            date: args.date,
          },
          headers,
        });
        return availRes.data;
      }
      case 'create_appointment': {
        const createRes = await barberApi.post('/appointments/create', args, { headers });
        return createRes.data;
      }
      case 'get_client_points': {
        const pointsRes = await barberApi.get(`/clients/${args.client_id}/points`, { headers });
        return pointsRes.data;
      }
      case 'get_recommended_haircuts': {
        const haircutsRes = await barberApi.get(`/haircuts/FaceType/${args.face_type}` , { headers });
        return haircutsRes.data;
      }
      default:
        return { error: 'Funcion no reconocida' };
    }
  } catch (error) {
    console.error('[Tools] Error en', call?.name, error?.message || error);
    return { error: 'Error al comunicarse con el servidor de la barberia.' };
  }
};
