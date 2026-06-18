const StatCard = ({ value, label }) => (
  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 flex items-center gap-2.5">
    <span className="font-['Bebas_Neue',sans-serif] text-2xl text-[#C9A84C]">{value}</span>
    <span className="text-[12px] text-[#555]">{label}</span>
  </div>
);

export const ReviewsStatsClient = ({ stats }) => (
  <div className="flex gap-3 mb-5 flex-wrap">
    <StatCard value={stats.totalReviews} label="reseñas" />
    <StatCard value={stats.averageScore} label="promedio ★" />
  </div>
);
