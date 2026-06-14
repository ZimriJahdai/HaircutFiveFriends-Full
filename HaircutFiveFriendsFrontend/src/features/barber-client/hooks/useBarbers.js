import { useEffect } from 'react';
import { useBarberClientStore } from '../store/useBarberClientStore';

/**
 * Hook que conecta la página con el store de Zustand.
 * Dispara la carga al montarse, igual que en barber-admin.
 */
export const useBarbers = () => {
  const { barbers, loading, error, getBarbers } = useBarberClientStore();

  useEffect(() => {
    getBarbers();
  }, [getBarbers]);

  return { barbers, loading, error, refetch: getBarbers };
};
