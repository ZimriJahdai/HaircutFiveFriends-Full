import { Link } from 'react-router-dom';
import { FavoriteButton } from './FavoriteButton.jsx';

export const FavoriteCard = ({ barber }) => (
  <div className="group relative rounded-2xl border border-[#1E1E1E] bg-[#111] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#00D2C4]/30 hover:shadow-[0_8px_32px_rgba(0,210,196,0.1)]">

    {/* Photo */}
    <div className="relative h-44 bg-[#181818] overflow-hidden flex items-center justify-center">
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
      <div className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        barber.status
          ? 'bg-[#00D2C4]/20 text-[#00D2C4] border border-[#00D2C4]/30'
          : 'bg-[#2A1515]/80 text-[#E88] border border-[#E88]/20'
      }`}>
        {barber.status ? 'Disponible' : 'No disponible'}
      </div>

      <FavoriteButton id={barber._id} className="absolute top-3 right-3" />
    </div>

    {/* Info */}
    <div className="p-4">
      <h3 className="font-['Bebas_Neue',sans-serif] text-xl tracking-[1.5px] text-[#E8E4DC] leading-tight mb-0.5">
        {barber.name}
      </h3>
      <p className="text-[11px] text-[#5A5A5A] mb-4">{barber.email}</p>

      {barber.phone && (
        <div className="flex items-center gap-2 text-[12px] text-[#5A5A5A] mb-4">
          <i className="ti ti-phone text-[#00D2C4] text-[13px]" aria-hidden="true" />
          <span>{barber.phone}</span>
        </div>
      )}

      <Link
        to="/client/reservar"
        state={{ barberId: barber._id, barberName: barber.name }}
        aria-disabled={!barber.status}
        className={[
          'flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 focus:outline-none',
          barber.status
            ? 'bg-[#00D2C4]/10 hover:bg-[#00D2C4] text-[#00D2C4] hover:text-[#0A0A0A] border border-[#00D2C4]/30 hover:border-[#00D2C4]'
            : 'bg-[#1A1A1A] text-[#5A5A5A] border border-[#2A2A2A] cursor-not-allowed pointer-events-none',
        ].join(' ')}
      >
        <i className="ti ti-calendar-event text-[13px]" aria-hidden="true" />
        {barber.status ? 'Reservar cita' : 'No disponible'}
      </Link>
    </div>
  </div>
);
