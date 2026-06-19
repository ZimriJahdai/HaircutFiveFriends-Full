const CATEGORY_ICONS = {
  CORTE_DE_CABELLO: 'ti-scissors',
  AFEITADO: 'ti-razor',
  RECORTES_DE_BARBA: 'ti-user',
  ARREGLO_DE_CABELLO: 'ti-sparkles',
  TRATAMIENTOS_CAPILARES: 'ti-droplet',
  TRATAMIENTOS_FACIALES: 'ti-star',
};

const CATEGORY_LABELS = {
  CORTE_DE_CABELLO: 'Corte de cabello',
  AFEITADO: 'Afeitado',
  RECORTES_DE_BARBA: 'Recortes de barba',
  ARREGLO_DE_CABELLO: 'Arreglo de cabello',
  TRATAMIENTOS_CAPILARES: 'Tratamientos capilares',
  TRATAMIENTOS_FACIALES: 'Tratamientos faciales',
};

import { FavoriteButton } from '../../favorites/components/FavoriteButton.jsx';

export const ServiceCard = ({ service }) => {
  return (
    <div className="group relative rounded-2xl border border-[#1E1E1E] bg-[#111] overflow-hidden shadow-[0_0_0_1px_rgba(0,210,196,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00D2C4]/30 hover:shadow-[0_8px_32px_rgba(0,210,196,0.1)]">
      <FavoriteButton
        id={service._id || service.id}
        typeFavorite="SERVICE"
        className="absolute top-4 right-4 z-10"
      />
      <div className="p-6 flex flex-col gap-4">
        {/* Icon + Name row */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00D2C4]/10 border border-[#00D2C4]/20 flex items-center justify-center text-[#00D2C4] text-2xl flex-shrink-0">
            <i className={`ti ${CATEGORY_ICONS[service.category] || 'ti-scissors'}`} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-['Bebas_Neue',sans-serif] text-xl tracking-[1.5px] text-[#E8E4DC] leading-tight mb-0.5">
              {service.name}
            </h3>
            <p className="text-[11px] text-[#5A5A5A]">
              {CATEGORY_LABELS[service.category] || service.category}
            </p>
          </div>
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider rounded-full px-2.5 py-0.5 font-semibold border text-[#00D2C4] bg-[#00D2C4]/10 border-[#00D2C4]/20">
            {CATEGORY_LABELS[service.category] || service.category}
          </span>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-[12px] text-[#777] leading-relaxed m-0">
            {service.description}
          </p>
        )}

        {/* Price + Duration row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1E1E1E] mt-1">
          <div className="flex items-center gap-3">
            <span className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[1px] text-[#00D2C4]">
              {service.price}
            </span>
            {service.pointsPrice && (
              <span className="text-[11px] text-[#5A5A5A] flex items-center gap-1">
                <i className="ti ti-star text-[11px]" />
                {service.pointsPrice} pts
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-[#5A5A5A]">
            <i className="ti ti-clock text-[13px]" />
            {service.duration}
          </span>
        </div>
      </div>
    </div>
  );
};
