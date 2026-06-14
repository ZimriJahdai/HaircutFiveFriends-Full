/**
 * BarberSearch — barra de búsqueda/filtrado para el catálogo de barberos.
 * Filtra por nombre. El padre gestiona el estado `query` y recibe `onChange`.
 */
export const BarberSearch = ({ query, onChange, total, filtered }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">

      {/* Search input */}
      <div className="relative flex-1 max-w-md">
        <i
          className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A5A] text-[16px] pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar barbero por nombre…"
          className="w-full pl-10 pr-10 py-2.5 bg-[#111] border border-[#2A2A2A] rounded-xl text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#00D2C4]/50 focus:ring-1 focus:ring-[#00D2C4]/20 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#E8E4DC] transition-colors focus:outline-none"
          >
            <i className="ti ti-x text-[14px]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Results counter */}
      {total > 0 && (
        <p className="text-[12px] text-[#5A5A5A] shrink-0">
          {query ? (
            <>
              <span className="text-[#00D2C4] font-semibold">{filtered}</span>
              {' '}de {total} barberos
            </>
          ) : (
            <>
              <span className="text-[#E8E4DC] font-semibold">{total}</span>
              {' '}barberos en total
            </>
          )}
        </p>
      )}
    </div>
  );
};
