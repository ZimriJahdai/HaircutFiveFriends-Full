import { useMemo } from 'react';

export const useReviewStats = (
  reviews = []
) => {

  return useMemo(() => {

    const totalReviews =
      reviews.length;

    const averageScore =
      totalReviews
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + review.score,
            0
          )
          /
          totalReviews
        ).toFixed(1)
      : '0.0';

    const barberIds =
      reviews
      .filter(
        review =>
          review.barberoId
      )
      .map(
        review =>
          review.barberoId?._id ||
          review.barberoId
      );

    const totalBarbers =
      new Set(
        barberIds
      ).size;

    const serviceReviews =
      reviews.filter(
        review =>
          review.servicioId
      ).length;

    return {
      totalReviews,
      averageScore,
      totalBarbers,
      serviceReviews,
    };

  }, [
    reviews
  ]);

};
