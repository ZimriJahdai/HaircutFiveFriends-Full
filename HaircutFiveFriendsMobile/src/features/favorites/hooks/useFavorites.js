import { useCallback, useEffect, useState } from 'react';

import { apiClient, getApiError, getId, unwrap } from '../../../shared/api';

// GET /favorites está auto-escopado al cliente autenticado (attachClientFromToken).
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/favorites');
      setFavorites(unwrap(res) || []);
    } catch (err) {
      setError(getApiError(err, 'No fue posible cargar tus favoritos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const findFavorite = useCallback(
    (typeFavorite, referenceId) =>
      favorites.find(
        (fav) => fav.typeFavorite === typeFavorite && String(getId(fav.referenceId) ?? fav.referenceId) === String(referenceId)
      ),
    [favorites]
  );

  const isFavorite = useCallback(
    (typeFavorite, referenceId) => Boolean(findFavorite(typeFavorite, referenceId)),
    [findFavorite]
  );

  const addFavorite = useCallback(
    async (typeFavorite, referenceId) => {
      try {
        await apiClient.post('/favorites', { typeFavorite, referenceId });
        await fetchFavorites();
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo agregar a favoritos') };
      }
    },
    [fetchFavorites]
  );

  const removeFavorite = useCallback(async (favoriteId) => {
    try {
      await apiClient.delete(`/favorites/${favoriteId}`);
      setFavorites((current) => current.filter((fav) => String(getId(fav)) !== String(favoriteId)));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo eliminar el favorito') };
    }
  }, []);

  const toggleFavorite = useCallback(
    async (typeFavorite, referenceId) => {
      const existing = findFavorite(typeFavorite, referenceId);
      if (existing) return removeFavorite(getId(existing));
      return addFavorite(typeFavorite, referenceId);
    },
    [findFavorite, addFavorite, removeFavorite]
  );

  // No hay endpoint de borrado masivo: se eliminan uno por uno.
  const clearAll = useCallback(async () => {
    await Promise.all(favorites.map((fav) => apiClient.delete(`/favorites/${getId(fav)}`).catch(() => null)));
    await fetchFavorites();
  }, [favorites, fetchFavorites]);

  return { favorites, loading, error, refetch: fetchFavorites, isFavorite, toggleFavorite, removeFavorite, clearAll };
}
