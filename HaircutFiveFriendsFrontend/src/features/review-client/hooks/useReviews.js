import { useEffect } from 'react';
import { useReviewClientStore } from '../store/useReviewClientStore';

/**
 * Hook que conecta la página con el store de Zustand.
 * Dispara la carga al montarse, igual que en barber-client.
 */
export const useReviews = () => {
  const { reviews, loading, error, getReviews, createReview, deleteReview } = useReviewClientStore();

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  return { reviews, loading, error, refetch: getReviews, createReview, deleteReview };
};
