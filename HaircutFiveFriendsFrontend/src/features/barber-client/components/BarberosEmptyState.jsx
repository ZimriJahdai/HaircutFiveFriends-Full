/**
 * BarberosEmptyState
 * variant: 'loading' | 'empty' | 'no-results'
 * onAction: called for 'no-results' to clear the search
 * query: shown inside the 'no-results' message
 */
export const BarberosEmptyState = ({ variant, onAction, query }) => {
  if (variant === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-[#5A5A5A] text-[13px]">
        <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-[#00D2C4] rounded-full animate-spin" />
        <span>Cargando barberos…</span>
      </div>
    );
  }

  if (variant === 'empty') {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <i className="ti ti-id-badge text-6xl text-[#222]" aria-hidden="true" />
        <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC]">
          Sin barberos registrados
        </h2>
        <p className="text-[#5A5A5A] text-[13px]">
          Vuelve pronto, estamos ampliando nuestro equipo.
        </p>
      </div>
    );
  }

  if (variant === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <i className="ti ti-search-off text-6xl text-[#222]" aria-hidden="true" />
        <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC]">
          Sin resultados
        </h2>
        <p className="text-[#5A5A5A] text-[13px]">
          No hay barberos que coincidan con{' '}
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
