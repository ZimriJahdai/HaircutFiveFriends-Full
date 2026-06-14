export const FavoritesHeader = ({ showClear, onClear }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
    <div>
      <h1 className="font-['Bebas_Neue',sans-serif] text-5xl sm:text-6xl tracking-[3px] text-[#E8E4DC] leading-none mb-2">
        Mis Favoritos
      </h1>
      <p className="text-[#5A5A5A] text-[14px]">
        Tus barberos guardados para acceder rápido.
      </p>
    </div>

    {showClear && (
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1.5 text-[12px] text-[#5A5A5A] hover:text-[#E88] border border-[#2A2A2A] hover:border-[#E88]/30 rounded-lg px-3 py-2 transition-colors focus:outline-none shrink-0"
      >
        <i className="ti ti-trash text-[14px]" aria-hidden="true" />
        Limpiar favoritos
      </button>
    )}
  </div>
);
