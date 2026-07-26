import { useCallback, useEffect, useState } from 'react';

import { apiClient, getApiError, getId, unwrap } from '../../../shared/api';
import { normalizeText } from '../../../shared/utils/format';

// No hay `?search=` en el backend: el filtro de búsqueda es del lado del cliente.
export function useBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // GET /review/promedio/:barberoId devuelve 404 si el barbero no tiene
  // reseñas todavía: se trata como "0.0, sin reseñas", no como un error.
  const fetchRating = useCallback(async (barberId) => {
    try {
      const res = await apiClient.get(`/review/promedio/${barberId}`);
      const data = unwrap(res);
      setRatings((prev) => ({
        ...prev,
        [barberId]: { averageScore: Number(data?.averageScore) || 0, totalReviews: data?.totalReviews || 0 },
      }));
    } catch {
      setRatings((prev) => ({ ...prev, [barberId]: { averageScore: 0, totalReviews: 0 } }));
    }
  }, []);

  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/barbers');
      const list = unwrap(res) || [];
      setBarbers(list);
      list.forEach((barber) => fetchRating(getId(barber)));
    } catch (err) {
      setError(getApiError(err, 'No fue posible cargar los barberos'));
    } finally {
      setLoading(false);
    }
  }, [fetchRating]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const query = normalizeText(search);
  const filteredBarbers = query ? barbers.filter((barber) => normalizeText(barber.name).includes(query)) : barbers;

  return { barbers: filteredBarbers, ratings, loading, error, search, setSearch, refetch: fetchBarbers };
}
