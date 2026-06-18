import { StarDisplay } from './StarDisplay';

export const ReviewCardAdmin = ({ review }) => {
  const targetName =
    review.barberoId?.name ||
    review.servicioId?.name ||
    'General';
  const targetType = review.barberoId ? 'Barbero' : 'Servicio';
  const date = new Date(review.createdAt).toLocaleDateString('es-GT', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex gap-3.5 items-start bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
      <div className="w-9 h-9 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[12px] font-medium text-[#C9A84C] shrink-0">
        FF
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
          <span className="text-[#E8E4DC] text-[13px] font-medium">Cliente</span>
          <StarDisplay value={review.score} />
          <span className="text-[11px] text-[#555] ml-auto">{date}</span>
        </div>
        <p className="text-[#888] text-[12px] m-0 leading-relaxed mb-2">{review.comment}</p>
        <span className="text-[11px] text-[#555]">
          <i className={`ti ${review.barberoId ? 'ti-id-badge' : 'ti-scissors'}`} /> {targetType}: <span className="text-[#777]">{targetName}</span>
        </span>
      </div>
    </div>
  );
};
