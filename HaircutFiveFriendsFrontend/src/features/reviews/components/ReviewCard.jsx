import { useState } from 'react';
import { deleteReview } from '../../../shared/api/review';
import { StarRating, StarDisplay } from './StarRating';

export const ReviewCard = ({ review, isAdmin = false, userEmail }) => {
  const [deleting, setDeleting] = useState(false);
  const isOwn = !isAdmin && review.clienteId?.email?.toLowerCase() === userEmail?.toLowerCase();
  const targetName = review.barberoId?.name || review.servicioId?.name || 'General';
  const targetType = review.barberoId ? 'Barbero' : 'Servicio';
  const date = new Date(review.createdAt).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    setDeleting(true);
    try { await deleteReview(review._id); } catch { setDeleting(false); }
  };

  if (isAdmin) {
    return (
      <div className="flex gap-3.5 items-start bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
        <div className="w-9 h-9 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[12px] font-medium text-[#C9A84C] shrink-0">FF</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span className="text-[#E8E4DC] text-[13px] font-medium">Cliente</span>
            <StarDisplay value={review.score} />
            <span className="text-[11px] text-[#555] ml-auto">{date}</span>
          </div>
          <p className="text-[#888] text-[12px] m-0 leading-relaxed mb-2">{review.comment}</p>
          <span className="text-[11px] text-[#555]"><i className={`ti ${review.barberoId ? 'ti-id-badge' : 'ti-scissors'}`} /> {targetType}: <span className="text-[#777]">{targetName}</span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-[#1E1E1E] bg-[#111] overflow-hidden shadow-[0_0_0_1px_rgba(0,210,196,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00D2C4]/30 hover:shadow-[0_8px_32px_rgba(0,210,196,0.1)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[12px] font-medium text-[#C9A84C] shrink-0">FF</div>
          <div>
            <div className="text-[#E8E4DC] text-[13px] font-medium">Cliente</div>
            <div className="text-[#555] text-[11px]">{date}</div>
          </div>
        </div>
        {isOwn && (
          <button onClick={handleDelete} disabled={deleting}
            className="bg-transparent border border-[#2A2A2A] rounded-lg px-2 py-1 text-[#555] hover:text-[#E88] hover:border-[#5A2020] cursor-pointer text-[13px] transition-colors disabled:opacity-50">
            <i className="ti ti-trash" />
          </button>
        )}
      </div>
      <StarRating value={review.score} readonly />
      <p className="text-[#AAA] text-[13px] mt-2 mb-0 leading-relaxed">{review.comment}</p>
      <div className="mt-3 pt-3 border-t border-[#1E1E1E] flex items-center gap-1.5">
        <span className="text-[11px] text-[#555]"><i className={`ti ${review.barberoId ? 'ti-id-badge' : 'ti-scissors'}`} /> {targetType}: <span className="text-[#777]">{targetName}</span></span>
      </div>
    </div>
  );
};
