import { useEffect } from 'react';
import { useReviewStore } from '../store/useReviewStore';

export const useReviews = () => {
  const reviews = useReviewStore((s) => s.reviews);
  const loading = useReviewStore((s) => s.loading);
  const error = useReviewStore((s) => s.error);
  const getReviews = useReviewStore((s) => s.getReviews);

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  return { reviews, loading, error, refetchReviews: getReviews };
};
