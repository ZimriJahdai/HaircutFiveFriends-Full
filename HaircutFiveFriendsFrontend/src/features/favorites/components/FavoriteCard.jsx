import { Link } from 'react-router-dom';
import { FavoriteButton } from './FavoriteButton.jsx';

export const FavoriteCard = ({ favorite }) => {
  const { typeFavorite, referenceId } = favorite;

  if (!referenceId) {
    return (
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6 text-center text-gray-500">
        Elemento no disponible
      </div>
    );
  }

  // Render variables depending on type
  let title = referenceId.name || 'Sin nombre';
  let imageSrc = null;
  let fallbackIcon = 'ti-star';
  let badgeText = typeFavorite;
  let detailsText = '';
  let footerAction = null;

  switch (typeFavorite) {
    case 'BARBER':
      imageSrc = referenceId.profilePicture;
      fallbackIcon = 'ti-user';
      badgeText = referenceId.status ? 'Barbero Disponible' : 'No Disponible';
      detailsText = referenceId.email || '';
      footerAction = (
        <Link
          to="/client/reservar"
          state={{ barberId: referenceId._id, barberName: referenceId.name }}
          aria-disabled={!referenceId.status}
          className={[
            'flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 focus:outline-none',
            referenceId.status
              ? 'bg-[#00D2C4]/10 hover:bg-[#00D2C4] text-[#00D2C4] hover:text-[#0A0A0A] border border-[#00D2C4]/30 hover:border-[#00D2C4]'
              : 'bg-[#1A1A1A] text-[#5A5A5A] border border-[#2A2A2A] cursor-not-allowed pointer-events-none',
          ].join(' ')}
        >
          <i className="ti ti-calendar-event text-[13px]" aria-hidden="true" />
          {referenceId.status ? 'Reservar cita' : 'No disponible'}
        </Link>
      );
      break;

    case 'PRODUCT':
      imageSrc = referenceId.image;
      fallbackIcon = 'ti-package';
      badgeText = `Categoría: ${referenceId.category}`;
      detailsText = `Precio: Q${Number(referenceId.price || 0).toFixed(2)} | Stock: ${referenceId.stock || 0}`;
      footerAction = (
        <div className="text-center py-2 px-4 rounded-lg bg-[#1A1A1A] text-[#00D2C4] text-[12px] font-semibold border border-[#00D2C4]/20">
          Q{Number(referenceId.price || 0).toFixed(2)}
        </div>
      );
      break;

    case 'SERVICE': {
      fallbackIcon = 'ti-scissors';
      badgeText = `Categoría: ${referenceId.category?.replace(/_/g, ' ')}`;
      detailsText = `Duración: ${referenceId.duration || 'N/A'}`;
      
      const formattedPrice = typeof referenceId.price === 'string' 
        ? referenceId.price 
        : `Q${Number(referenceId.price || 0).toFixed(2)}`;
      
      footerAction = (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-bold text-[#E8E4DC]">{formattedPrice}</span>
          <Link
            to="/client/reservar"
            state={{ serviceId: referenceId._id, serviceName: referenceId.name }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold bg-[#00D2C4]/10 hover:bg-[#00D2C4] text-[#00D2C4] hover:text-[#0A0A0A] border border-[#00D2C4]/30 hover:border-[#00D2C4] transition-all duration-200"
          >
            Reservar
          </Link>
        </div>
      );
      break;
    }

    case 'HAIRCUT':
      imageSrc = referenceId.imageRef;
      fallbackIcon = 'ti-scissors';
      badgeText = `Cara: ${referenceId.faceTypeRecommended || 'CUALQUIERA'}`;
      detailsText = referenceId.description || '';
      footerAction = (
        <Link
          to="/client/reservar"
          state={{ haircutId: referenceId._id, haircutName: referenceId.name }}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold bg-[#00D2C4]/10 hover:bg-[#00D2C4] text-[#00D2C4] hover:text-[#0A0A0A] border border-[#00D2C4]/30 hover:border-[#00D2C4] transition-all duration-200"
        >
          Elegir Corte para Cita
        </Link>
      );
      break;

    default:
      break;
  }

  return (
    <div className="group relative rounded-2xl border border-[#1E1E1E] bg-[#111] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#00D2C4]/30 hover:shadow-[0_8px_32px_rgba(0,210,196,0.1)]">
      {/* Top Media / Header Area */}
      <div className="relative h-44 bg-[#181818] overflow-hidden flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#333]">
            <i className={`ti ${fallbackIcon} text-5xl`} aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[1px]">Sin imagen</span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#00D2C4]/20 text-[#00D2C4] border border-[#00D2C4]/30 backdrop-blur-sm">
          {badgeText}
        </div>

        {/* Heart button */}
        <FavoriteButton id={referenceId._id || referenceId.id} typeFavorite={typeFavorite} className="absolute top-3 right-3" />
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col h-[180px] justify-between">
        <div>
          <h3 className="font-['Bebas_Neue',sans-serif] text-xl tracking-[1.5px] text-[#E8E4DC] leading-tight mb-1 truncate">
            {title}
          </h3>
          <p className="text-[12px] text-[#888] line-clamp-3 mb-2">{detailsText}</p>
        </div>

        <div>
          {footerAction}
        </div>
      </div>
    </div>
  );
};
