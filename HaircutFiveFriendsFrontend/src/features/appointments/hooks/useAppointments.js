import { useEffect, useCallback } from 'react';
import { useAppointmentStore } from '../store/useAppointmentStore.js';

// Hook para la vista admin/empleado. Permite filtrar por fecha (YYYY-MM-DD).
export const useAppointments = (date = null) => {
  const appointments = useAppointmentStore((s) => s.appointments);
  const loading = useAppointmentStore((s) => s.loading);
  const error = useAppointmentStore((s) => s.error);
  const fetchAppointments = useAppointmentStore((s) => s.fetchAppointments);

  const refetch = useCallback(() => fetchAppointments(date), [fetchAppointments, date]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { appointments, loading, error, refetch };
};
