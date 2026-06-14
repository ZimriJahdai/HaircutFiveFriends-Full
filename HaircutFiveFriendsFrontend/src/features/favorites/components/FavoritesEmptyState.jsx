import { Link } from 'react-router-dom';

const VARIANTS = {
  loading: {
    content: (
      <div className="flex flex-col items-center gap-4 py-24 text-[#5A5A5A] text-[13px]">
        <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-[#00D2C4] rounded-full animate-spin" />
        <span>Cargando…</span>
      </div>
    ),
  },
  empty: {
    content: (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <i className="ti ti-heart text-7xl text-[#1E1E1E]" aria-hidden="true" />
        <div>
          <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC] mb-1">
            Aún no tienes favoritos
          </h2>
          <p className="text-[#5A5A5A] text-[13px] max-w-xs mx-auto">
            Ve al catálogo de barberos y presiona{' '}
            <i className="ti ti-heart text-[#00D2C4]" aria-hidden="true" />{' '}
            para guardar los que más te gusten.
          </p>
        </div>
        <Link
          to="/client/barberos"
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#00D2C4]/10 text-[#00D2C4] border border-[#00D2C4]/30 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors focus:outline-none"
        >
          <i className="ti ti-users text-[15px]" aria-hidden="true" />
          Ver barberos
        </Link>
      </div>
    ),
  },
};

/**
 * FavoritesEmptyState
 * variant: 'loading' | 'empty' | 'unavailable' | 'no-results'
 * onAction: callback for 'unavailable' (clear list) and 'no-results' (clear search)
 * query: shown in the 'no-results' message
 */
export const FavoritesEmptyState = ({ variant, onAction, query }) => {
  if (VARIANTS[variant]) return VARIANTS[variant].content;

  if (variant === 'unavailable') {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <i className="ti ti-heart-broken text-7xl text-[#1E1E1E]" aria-hidden="true" />
        <div>
          <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC] mb-1">
            Favoritos no disponibles
          </h2>
          <p className="text-[#5A5A5A] text-[13px]">
            Los barberos guardados ya no están disponibles.
          </p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="text-[12px] text-[#E88] hover:underline focus:outline-none"
        >
          Limpiar lista
        </button>
      </div>
    );
  }

  if (variant === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <i className="ti ti-search-off text-5xl text-[#222]" aria-hidden="true" />
        <p className="text-[#5A5A5A] text-[13px]">
          Ningún favorito coincide con{' '}
          <span className="text-[#E8E4DC]">"{query}"</span>
        </p>
        <button
          type="button"
          onClick={onAction}
          className="text-[12px] text-[#00D2C4] hover:underline focus:outline-none"
        >
          Limpiar búsqueda
        </button>
      </div>
    );
  }

  return null;
};
