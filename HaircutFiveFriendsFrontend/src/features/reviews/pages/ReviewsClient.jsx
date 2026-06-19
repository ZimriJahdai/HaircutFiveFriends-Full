import { useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useReviews } from '../hooks/useReviews';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewEmptyState } from '../components/ReviewEmptyState';
import { ReviewsStats } from '../components/ReviewsStats';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewsTabs } from '../components/ReviewsTabs';
import NavbarClient from '../../client/components/NavbarClient';

export const ReviewsClient = () => {
  const { reviews, loading, error, refetchReviews } = useReviews();
  const user = useAuthStore(s => s.user);
  const userEmail = user?.email?.toLowerCase();
  const [tab, setTab] = useState('todas');

  const filteredReviews = useMemo(() => {
    if (tab === 'mias') return reviews.filter(r => r.clienteId?.email?.toLowerCase() === userEmail);
    return reviews;
  }, [reviews, tab, userEmail]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-['Bebas_Neue',sans-serif] text-5xl sm:text-6xl tracking-[3px] text-[#E8E4DC] leading-none mb-2">Reseñas</h1>
          <p className="text-[#5A5A5A] text-[14px]">Comparte tu experiencia con Five Friends.</p>
        </div>
        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />
        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[13px] text-[#E88] flex items-center gap-3 mb-8">
            <i className="ti ti-alert-circle text-lg" aria-hidden="true" />{error}
            <button type="button" onClick={refetchReviews} className="ml-auto text-[#C9A84C] hover:underline text-[12px]">Reintentar</button>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24 text-[#5A5A5A] text-[13px]">
            <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-[#00D2C4] rounded-full animate-spin" />
            <span>Cargando reseñas…</span>
          </div>
        ) : (
          <>
            <ReviewForm />
            <ReviewsTabs tab={tab} setTab={setTab} />
            <ReviewsStats reviews={filteredReviews} />
            {filteredReviews.length === 0 ? (
              <ReviewEmptyState message={tab === 'mias' ? 'Aún no has escrito ninguna reseña.' : 'No hay reseñas todavía.'} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredReviews.map(review => <ReviewCard key={review._id} review={review} userEmail={userEmail} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
