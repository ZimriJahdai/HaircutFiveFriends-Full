import { useEffect, useCallback } from 'react';
import { useAppointmentStore } from '../store/useAppointmentStore.js';

// Hook para la vista del cliente: solo sus propias citas (token-scoped).
export const useMyAppointments = () => {
  const appointments = useAppointmentStore((s) => s.appointments);
  const loading = useAppointmentStore((s) => s.loading);
  const error = useAppointmentStore((s) => s.error);
  const fetchMyAppointments = useAppointmentStore((s) => s.fetchMyAppointments);

  const refetch = useCallback(() => fetchMyAppointments(), [fetchMyAppointments]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { appointments, loading, error, refetch };
};
