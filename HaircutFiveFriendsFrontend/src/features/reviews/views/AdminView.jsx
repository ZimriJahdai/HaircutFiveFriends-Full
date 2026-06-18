import { useMemo, useState } from 'react';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewEmptyState } from '../components/ReviewEmptyState';
import { ReviewsStats } from '../components/ReviewsStats';
import { ReviewsCharts } from '../components/ReviewsCharts';
import { ReviewsFilter } from '../components/ReviewsFilter';

export const AdminView = ({ reviews, loading, error: storeError }) => {
  const [filter, setFilter] = useState('todos');

  const filteredReviews = useMemo(() => {
    switch (filter) {
      case 'barbero':
        return reviews.filter((r) => r.barberoId);
      case 'servicio':
        return reviews.filter((r) => r.servicioId);
      default:
        return reviews;
    }
  }, [reviews, filter]);

  return (
    <>
      {storeError && (
        <div style={{ background: '#2A1515', border: '1px solid #5A2020', color: '#E88', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
          {storeError}
        </div>
      )}
      <ReviewsStats reviews={reviews} isAdmin />
      <ReviewsCharts reviews={reviews} />
      <ReviewsFilter filter={filter} setFilter={setFilter} total={filteredReviews.length} />
      {filteredReviews.length === 0 ? (
        <ReviewEmptyState icon="ti-message-off" message="No hay reseñas con este filtro." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredReviews.map((review) => (
            <ReviewCard key={review._id} review={review} isAdmin />
          ))}
        </div>
      )}
    </>
  );
};
