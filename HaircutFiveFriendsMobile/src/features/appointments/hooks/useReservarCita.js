import { useCallback, useState } from 'react';

import { apiClient, getApiError, unwrap } from '../../../shared/api';

// El backend auto-asigna clienteId (por token) y un barbero aleatorio
// disponible para USER_ROLE: solo se envía serviceId + appointmentDate.
export function useReservarCita() {
  const [loading, setLoading] = useState(false);

  const createAppointment = useCallback(async ({ serviceId, appointmentDate }) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/appointments/create', {
        serviceId,
        appointmentDate: appointmentDate.toISOString(),
      });
      return { ok: true, data: unwrap(res) };
    } catch (error) {
      // 409 = el barbero asignado no está disponible; el backend sugiere otro horario.
      const conflict = error.response?.data?.conflict;
      return {
        ok: false,
        error: getApiError(error, 'No se pudo reservar la cita'),
        suggestedTime: conflict?.suggestedTime,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, createAppointment };
}
