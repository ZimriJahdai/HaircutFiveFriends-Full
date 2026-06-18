const adminStats = (stats) => [
  { label: 'Total reseñas', value: stats.totalReviews, icon: 'ti-message' },
  { label: 'Calificación promedio', value: `${stats.averageScore} ★`, icon: 'ti-star' },
  { label: 'Barberos evaluados', value: stats.totalBarbers, icon: 'ti-id-badge' },
  { label: 'Reseñas de servicio', value: stats.serviceReviews, icon: 'ti-scissors' },
];

export const ReviewsStatsAdmin = ({ stats }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
    {adminStats(stats).map((stat) => (
      <div
        key={stat.label}
        className="bg-[#1A1A1A] border-l-[3px] border-[#C9A84C] rounded-tr-xl rounded-br-xl px-4 py-3.5"
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-[#5A5A5A]">{stat.label}</span>
          <i className={`ti ${stat.icon} text-[#C9A84C] opacity-50`} />
        </div>
        <div className="font-['Bebas_Neue',sans-serif] text-[26px] text-[#E8E4DC] leading-none">
          {stat.value}
        </div>
      </div>
    ))}
  </div>
);
