import { useState, useEffect, useRef } from 'react';

export const HaircutCard = ({ haircut, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C]/50 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,168,76,0.06)] relative group">
      {/* Image */}
      <div className="w-full h-[180px] overflow-hidden bg-[#111]">
        {haircut.imageRef ? (
          <img src={haircut.imageRef} alt={haircut.name} className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#333] text-4xl">
            <i className="ti ti-scissors" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-3.5 pb-1.5 flex flex-col items-start gap-1">
        <h3 className="text-[15px] font-semibold text-[#E8E4DC] leading-tight">{haircut.name}</h3>
        <p className="text-[12px] text-[#5A5A5A] mt-1 mb-2 leading-relaxed line-clamp-2 w-full">{haircut.description || 'Sin descripción'}</p>
      </div>

      {/* Footer: price + duration + menu */}
      <div className="flex items-center justify-between px-4 pb-3.5">
        <div className="flex items-center gap-4">
          {haircut.faceTypeRecommended && (
            <span className="flex items-center gap-1 text-[12px] text-[#888]">
              <i className="ti ti-user-circle text-[#A78BFA] text-[16px]" aria-hidden="true" />
              {haircut.faceTypeRecommended === 'CUALQUIERA' ? 'Cualquiera' : haircut.faceTypeRecommended.charAt(0).toUpperCase() + haircut.faceTypeRecommended.slice(1).toLowerCase()}
            </span>
          )}
        </div>

        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] p-1 text-lg leading-none transition-colors focus:outline-none"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Opciones"
          >
            <i className="ti ti-dots-vertical" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="absolute right-3 bottom-[42px] bg-[#222] border border-[#2A2A2A] rounded-lg py-1 min-w-[140px] z-20 shadow-2xl">
              <button
                className="flex items-center gap-2 w-full px-3.5 py-2 text-[12px] text-[#999] hover:text-[#E8E4DC] hover:bg-[#2A2A2A] transition-colors text-left"
                onClick={() => { setMenuOpen(false); onEdit(haircut); }}
              >
                <i className="ti ti-edit" aria-hidden="true" /> Editar
              </button>
              <button
                className="flex items-center gap-2 w-full px-3.5 py-2 text-[12px] text-[#c77] hover:text-[#E05252] hover:bg-[#2A2A2A] transition-colors text-left"
                onClick={() => { setMenuOpen(false); onDelete(haircut); }}
              >
                <i className="ti ti-trash" aria-hidden="true" /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
