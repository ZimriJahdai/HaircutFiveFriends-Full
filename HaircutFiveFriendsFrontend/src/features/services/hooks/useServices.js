import { useEffect } from 'react';
import { useServiceStore } from '../store/useServiceStore';

export const useServices = () => {
  const services = useServiceStore((s) => s.services);
  const loading = useServiceStore((s) => s.loading);
  const error = useServiceStore((s) => s.error);
  const getServices = useServiceStore((s) => s.getServices);

  useEffect(() => {
    getServices();
  }, [getServices]);

  return { services, loading, error, refetchServices: getServices };
};
