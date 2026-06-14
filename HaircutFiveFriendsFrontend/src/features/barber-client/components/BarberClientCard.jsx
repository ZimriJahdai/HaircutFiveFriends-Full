import { FavoriteButton } from '../../favorites/components/FavoriteButton.jsx';

/**
 * BarberClientCard — tarjeta de presentación de un barbero desde la vista de cliente.
 */
export const BarberClientCard = ({ barber }) => {
  return (
    <div className="group relative rounded-2xl border border-[#1E1E1E] bg-[#111] overflow-hidden shadow-[0_0_0_1px_rgba(0,210,196,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00D2C4]/30 hover:shadow-[0_8px_32px_rgba(0,210,196,0.1)]">

      {/* Photo */}
      <div className="relative h-52 bg-[#181818] overflow-hidden flex items-center justify-center">
        {barber.profilePicture ? (
          <img
            src={barber.profilePicture}
            alt={barber.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#333]">
            <i className="ti ti-user text-5xl" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[1px]">Sin foto</span>
          </div>
        )}

        {/* Status badge */}
        <div className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow ${
          barber.status
            ? 'bg-[#00D2C4]/20 text-[#00D2C4] border border-[#00D2C4]/30'
            : 'bg-[#2A1515]/80 text-[#E88] border border-[#E88]/20'
        }`}>
          {barber.status ? 'Disponible' : 'No disponible'}
        </div>

        {/* Favorite button */}
        <FavoriteButton
          id={barber._id}
          className="absolute top-3 right-3"
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-['Bebas_Neue',sans-serif] text-xl tracking-[1.5px] text-[#E8E4DC] leading-tight mb-0.5">
          {barber.name}
        </h3>
        <p className="text-[12px] text-[#5A5A5A] mb-4">{barber.email}</p>

        <div className="space-y-2.5">
          {barber.phone && (
            <div className="flex items-center gap-2 text-[12px] text-[#5A5A5A]">
              <i className="ti ti-phone text-[#00D2C4] text-[14px]" aria-hidden="true" />
              <span>{barber.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
