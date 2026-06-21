import { BarberClientCard } from './BarberClientCard.jsx';

/**
 * BarberSection — sección de barberos con título, icono, badge y grid.
 * Reutilizable para "Disponibles" e "No disponibles".
 */
export const BarberSection = ({ title, icon, barbers, active, statsMap = {} }) => {
  if (!barbers.length) return null;

  return (
    <section className={active ? 'mb-12' : ''}>
      <div className="flex items-center gap-3 mb-6">
        <i
          className={`${icon} text-[18px] ${active ? 'text-[#00D2C4]' : 'text-[#5A5A5A]'}`}
          aria-hidden="true"
        />
        <h2 className={`font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] ${active ? 'text-[#E8E4DC]' : 'text-[#5A5A5A]'}`}>
          {title}
        </h2>
        <span className={`text-[11px] rounded-full px-2.5 py-0.5 font-semibold border ${
          active
            ? 'text-[#00D2C4] bg-[#00D2C4]/10 border-[#00D2C4]/20'
            : 'text-[#5A5A5A] bg-[#1E1E1E] border-[#2A2A2A]'
        }`}>
          {barbers.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {barbers.map((barber) => (
          <BarberClientCard key={barber._id} barber={barber} reviewStats={statsMap[barber._id || barber.id]} />
        ))}
      </div>
    </section>
  );
};
