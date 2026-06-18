import { useMemo } from 'react';
import { ReviewsStatsAdmin } from './ReviewsStatsAdmin';
import { ReviewsStatsClient } from './ReviewsStatsClient';

const useReviewStats = (reviews = []) => {
  return useMemo(() => {
    const totalReviews = reviews.length;
    const averageScore = totalReviews
      ? (reviews.reduce((sum, r) => sum + r.score, 0) / totalReviews).toFixed(1)
      : '0.0';
    const barberIds = reviews
      .filter((r) => r.barberoId)
      .map((r) => r.barberoId?._id || r.barberoId);
    const totalBarbers = new Set(barberIds).size;
    const serviceReviews = reviews.filter((r) => r.servicioId).length;
    return { totalReviews, averageScore, totalBarbers, serviceReviews };
  }, [reviews]);
};

export const ReviewsStats = ({ reviews, isAdmin = false }) => {
  const stats = useReviewStats(reviews);

  if (isAdmin) {
    return <ReviewsStatsAdmin stats={stats} />;
  }

  return <ReviewsStatsClient stats={stats} />;
};
