import { useState } from 'react';

export const BarberCard = ({ barber, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative rounded-2xl border border-[#2A2A2A] bg-[#111] overflow-hidden shadow-[0_0_0_1px_rgba(201,168,76,0.08)] transition-transform hover:-translate-y-0.5">
      <div className="relative h-48 bg-[#181818] flex items-center justify-center overflow-hidden">
        {barber.profilePicture ? (
          <img src={barber.profilePicture} alt={barber.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#5A5A5A] text-[12px] uppercase tracking-[1px]">Sin foto</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-[#E8E4DC] leading-tight">{barber.name}</h3>
            <p className="text-[12px] text-[#8E8E8E] mt-1">{barber.email}</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-[#8E8E8E] hover:text-[#E8E4DC] focus:outline-none"
            aria-label="Abrir menú"
          >
            <i className="ti ti-dots" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[12px] text-[#5A5A5A]">
            <span>Teléfono</span>
            <span className="text-[#E8E4DC]">{barber.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-[12px] text-[#5A5A5A]">
            <span>Estado</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${barber.status ? 'bg-[#1E3E1E] text-[#8E8]' : 'bg-[#301E1E] text-[#E88]'}`}>
              {barber.status ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute right-4 top-4 z-20 w-36 rounded-xl border border-[#2A2A2A] bg-[#0E0E0E] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit(barber);
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-[13px] text-[#E8E4DC] hover:bg-[#1F1F1F]"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete(barber);
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-[13px] text-[#E88] hover:bg-[#1F1F1F]"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
