import { useCallback, useEffect, useState } from 'react';

import { apiClient, getApiError, unwrap } from '../../../shared/api';
import { normalizeText } from '../../../shared/utils/format';

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/service/obtener');
      setServices(unwrap(res) || []);
    } catch (err) {
      setError(getApiError(err, 'No fue posible cargar los servicios'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const query = normalizeText(search);
  const activeServices = services.filter((service) => service.status === 'activo');
  const filteredServices = query
    ? activeServices.filter((service) => normalizeText(service.name).includes(query))
    : activeServices;

  return { services: filteredServices, loading, error, search, setSearch, refetch: fetchServices };
}
