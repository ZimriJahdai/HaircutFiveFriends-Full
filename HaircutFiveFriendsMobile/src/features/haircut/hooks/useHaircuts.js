import { useCallback, useEffect, useState } from 'react';
import { apiClient, getApiError, unwrap } from '../../../shared/api';

// GET /haircuts es un endpoint del backend de HaircutFiveFriends que devuelve
// los cortes registrados con imagen, nombre, descripción y tipo de rostro.
export function useHaircuts() {
  const [haircuts, setHaircuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHaircuts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/haircuts');
      setHaircuts(unwrap(response, 'haircut') || []);
    } catch (err) {
      setError(getApiError(err, 'No fue posible cargar los estilos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHaircuts();
  }, [fetchHaircuts]);

  return { haircuts, loading, error, refetch: fetchHaircuts };
}
