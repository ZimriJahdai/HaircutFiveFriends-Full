import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiClient, getApiError, getId, unwrap } from '../../../shared/api';
import { useClientProfileStore } from '../../../shared/store/clientProfileStore';

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const clientId = useClientProfileStore((state) => state.clientId);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/review/obtener');
      setReviews(unwrap(res) || []);
    } catch (err) {
      setError(getApiError(err, 'No fue posible cargar las reseñas'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // No hay `?mine=true` en el backend: se filtra del lado del cliente por clientId resuelto.
  const myReviews = useMemo(
    () => reviews.filter((review) => String(getId(review.clienteId) ?? review.clienteId) === String(clientId)),
    [reviews, clientId]
  );

  const createReview = useCallback(
    async ({ barberoId, servicioName, score, comment }) => {
      setSubmitting(true);
      try {
        await apiClient.post('/review/crear', { barberoId, servicioName, score, comment });
        await fetchReviews();
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo crear la reseña') };
      } finally {
        setSubmitting(false);
      }
    },
    [fetchReviews]
  );

  const updateReview = useCallback(
    async (id, { score, comment }) => {
      setSubmitting(true);
      try {
        await apiClient.put(`/review/actualizar/${id}`, { score, comment });
        await fetchReviews();
        return { ok: true };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo actualizar la reseña') };
      } finally {
        setSubmitting(false);
      }
    },
    [fetchReviews]
  );

  const deleteReview = useCallback(async (id) => {
    try {
      await apiClient.delete(`/review/eliminar/${id}`);
      setReviews((current) => current.filter((review) => String(getId(review)) !== String(id)));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo eliminar la reseña') };
    }
  }, []);

  return {
    reviews,
    myReviews,
    loading,
    error,
    submitting,
    refetch: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
  };
}
