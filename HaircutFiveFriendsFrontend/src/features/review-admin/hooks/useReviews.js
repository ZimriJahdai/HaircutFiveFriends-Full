import { useEffect } from 'react';
import { useReviewAdminStore } from '../store/useReviewAdminStore';

/**
 * Hook que conecta la página con el store de Zustand.
 * Dispara la carga al montarse, igual que en barber-admin.
 */
export const useReviews = () => {
  const { reviews, loading, error, getReviews, deleteReview } = useReviewAdminStore();

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  return { reviews, loading, error, refetch: getReviews, deleteReview };
};
