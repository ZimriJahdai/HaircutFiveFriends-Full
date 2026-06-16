import { useMemo } from 'react';

export const useReviewCharts = (
  reviews = []
) => {

  const scoreDistribution =
    useMemo(() => {
      return [1, 2, 3, 4, 5]
      .map(score => ({
        score,
        count:
          reviews.filter(
            review =>
              review.score === score
          ).length
      }));
    }, [
      reviews
    ]);

  const barberAverages =
    useMemo(() => {
      const barberMap = {};
      reviews
      .filter(
        review =>
          review.barberoId
      )
      .forEach(review => {
        const id =
          review.barberoId?._id ||
          review.barberoId;
        const name =
          review.barberoId?.name ||
          'Desconocido';
        if (!barberMap[id]) {
          barberMap[id] = {
            name,
            scores: []
          };
        }
        barberMap[id]
          .scores
          .push(
            review.score
          );
      });
      return Object.values(
        barberMap
      )
      .map(barber => ({
        name:
          barber.name,
        avg:
          (
            barber.scores.reduce(
              (a, b) => a + b,
              0
            )
            /
            barber.scores.length
          ).toFixed(1),
        count:
          barber.scores.length,
      }))
      .sort(
        (a, b) =>
          b.avg - a.avg
      );
    }, [
      reviews
    ]);

  return {
    scoreDistribution,
    barberAverages,
  };
};
