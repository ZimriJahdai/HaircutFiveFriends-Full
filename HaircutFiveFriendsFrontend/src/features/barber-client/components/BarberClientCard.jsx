import { FavoriteButton } from '../../favorites/components/FavoriteButton.jsx';
import { StarDisplay } from '../../reviews/components/StarRating.jsx';

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_NAMES_SPANISH = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const SCHEDULE_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri

export const BarberClientCard = ({ barber, reviewStats }) => {
  const scheduleMap = {};
  if (barber.schedule) {
    barber.schedule.forEach((s) => {
      scheduleMap[s.days] = s.hours;
    });
  }

  const parseHours = (hours) => {
    if (!hours) return null;
    const parts = hours.split(' - ');
    return parts.length === 2 ? `${parts[0]}-${parts[1]}` : hours;
  };
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

        {/* Reviews */}
        {reviewStats && reviewStats.total > 0 ? (
          <div className="flex items-center gap-2 mb-3">
            <StarDisplay value={parseFloat(reviewStats.average)} />
            <span className="text-[11px] text-[#5A5A5A]">
              {reviewStats.average} ({reviewStats.total} {reviewStats.total === 1 ? 'reseña' : 'reseñas'})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-[#444]">☆☆☆☆☆</span>
            <span className="text-[11px] text-[#444]">Sin reseñas</span>
          </div>
        )}

        <p className="text-[12px] text-[#5A5A5A] mb-3">{barber.email}</p>

        <div className="space-y-2.5">
          {barber.phone && (
            <div className="flex items-center gap-2 text-[12px] text-[#5A5A5A]">
              <i className="ti ti-phone text-[#00D2C4] text-[14px]" aria-hidden="true" />
              <span>{barber.phone}</span>
            </div>
          )}

          {/* Schedule */}
          {barber.schedule && barber.schedule.length > 0 && (
            <div className="pt-2 mt-2 border-t border-[#1E1E1E]">
              <div className="flex items-center gap-2 text-[11px] text-[#5A5A5A] mb-1.5">
                <i className="ti ti-clock text-[#00D2C4] text-[12px]" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-[1px] font-semibold">Horario</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {SCHEDULE_DAYS.map((dayNum) => {
                  const dayName = DAY_NAMES_SPANISH[dayNum];
                  const hours = scheduleMap[dayName];
                  return (
                    <div key={dayNum} className="text-center">
                      <div className="text-[9px] text-[#444] uppercase">{DAY_NAMES_SHORT[dayNum]}</div>
                      <div className={`text-[10px] ${hours ? 'text-[#00D2C4]' : 'text-[#2A2A2A]'}`}>
                        {hours ? parseHours(hours) : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
