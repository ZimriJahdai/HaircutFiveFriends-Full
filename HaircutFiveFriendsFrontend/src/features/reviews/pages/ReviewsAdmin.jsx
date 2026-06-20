import { useMemo, useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewEmptyState } from '../components/ReviewEmptyState';
import { ReviewsStats } from '../components/ReviewsStats';
import { ReviewsCharts } from '../components/ReviewsCharts';
import { ReviewsFilter } from '../components/ReviewsFilter';

export const ReviewsAdmin = () => {
  const { reviews, loading, error } = useReviews();
  const [filter, setFilter] = useState('todos');

  const filteredReviews = useMemo(() => {
    switch (filter) {
      case 'barbero': return reviews.filter(r => r.barberoId);
      case 'servicio': return reviews.filter(r => r.servicioId);
      default: return reviews;
    }
  }, [reviews, filter]);

  return (
    <div className="font-sans text-[#E8E4DC] w-full">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <div className="mb-6">
        <h1 className="font-['Bebas_Neue',sans-serif] text-[38px] tracking-[3px] text-[#E8E4DC] m-0">Reseñas</h1>
        <p className="text-[13px] text-[#5A5A5A] mt-1">Vista general de las calificaciones recibidas.</p>
      </div>
      <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

      {error && (
        <div style={{ background: '#2A1515', border: '1px solid #5A2020', color: '#E88', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12 text-[#555]">Cargando reseñas...</div>
      ) : (
        <>
          <ReviewsStats reviews={reviews} isAdmin />
          <ReviewsCharts reviews={reviews} />
          <ReviewsFilter filter={filter} setFilter={setFilter} total={filteredReviews.length} />
          {filteredReviews.length === 0 ? (
            <ReviewEmptyState icon="ti-message-off" message="No hay reseñas con este filtro." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredReviews.map(review => <ReviewCard key={review._id} review={review} isAdmin />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};
