import { useCallback, useEffect, useState } from 'react';

import { apiClient, getApiError, unwrap } from '../../../shared/api';

export function useMyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/appointments/mine');
      setAppointments(unwrap(res) || []);
    } catch (err) {
      setError(getApiError(err, 'No fue posible cargar tus citas'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Cancelación suave: el backend marca status=CANCELADA, no borra el registro.
  const cancelAppointment = useCallback(
    async (appointmentId) => {
      try {
        await apiClient.delete(`/appointments/${appointmentId}`);
        await fetchAppointments();
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo cancelar la cita') };
      }
    },
    [fetchAppointments]
  );

  const upcoming = appointments
    .filter((appointment) => appointment.status === 'PENDIENTE')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  return { appointments, upcoming, loading, error, refetch: fetchAppointments, cancelAppointment };
}
