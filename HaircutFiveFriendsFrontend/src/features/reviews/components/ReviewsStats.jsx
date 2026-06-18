import { useMemo } from 'react';

const useReviewStats = (reviews = []) => useMemo(() => {
  const totalReviews = reviews.length;
  const averageScore = totalReviews ? (reviews.reduce((sum, r) => sum + r.score, 0) / totalReviews).toFixed(1) : '0.0';
  const barberIds = reviews.filter((r) => r.barberoId).map((r) => r.barberoId?._id || r.barberoId);
  return { totalReviews, averageScore, totalBarbers: new Set(barberIds).size, serviceReviews: reviews.filter((r) => r.servicioId).length };
}, [reviews]);

export const ReviewsStats = ({ reviews, isAdmin = false }) => {
  const stats = useReviewStats(reviews);

  if (isAdmin) {
    const items = [
      { label: 'Total reseñas', value: stats.totalReviews, icon: 'ti-message' },
      { label: 'Calificación promedio', value: `${stats.averageScore} ★`, icon: 'ti-star' },
      { label: 'Barberos evaluados', value: stats.totalBarbers, icon: 'ti-id-badge' },
      { label: 'Reseñas de servicio', value: stats.serviceReviews, icon: 'ti-scissors' },
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {items.map((s) => (
          <div key={s.label} className="bg-[#1A1A1A] border-l-[3px] border-[#C9A84C] rounded-tr-xl rounded-br-xl px-4 py-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-[#5A5A5A]">{s.label}</span>
              <i className={`ti ${s.icon} text-[#C9A84C] opacity-50`} />
            </div>
            <div className="font-['Bebas_Neue',sans-serif] text-[26px] text-[#E8E4DC] leading-none">{s.value}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-5 flex-wrap">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 flex items-center gap-2.5">
        <span className="font-['Bebas_Neue',sans-serif] text-2xl text-[#C9A84C]">{stats.totalReviews}</span>
        <span className="text-[12px] text-[#555]">reseñas</span>
      </div>
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 flex items-center gap-2.5">
        <span className="font-['Bebas_Neue',sans-serif] text-2xl text-[#C9A84C]">{stats.averageScore}</span>
        <span className="text-[12px] text-[#555]">promedio ★</span>
      </div>
    </div>
  );
};
