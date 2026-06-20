const CATEGORY_LABELS_SHORT = {
  CORTE_DE_CABELLO: 'Corte',
  AFEITADO: 'Afeitado',
  RECORTES_DE_BARBA: 'Barba',
  ARREGLO_DE_CABELLO: 'Arreglo',
  TRATAMIENTOS_CAPILARES: 'Cap.',
  TRATAMIENTOS_FACIALES: 'Facial',
};

const HEADERS = ['Nombre', 'Categoría', 'Precio', 'Puntos', 'Duración', 'Estado', 'Acciones'];

export const ServiceTable = ({ services, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="border-b border-[#1E1E1E]">
          {HEADERS.map(h => (
            <th key={h} className="px-3 py-2.5 text-left text-[#5A5A5A] text-[10px] tracking-[1px] uppercase font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {services.map(s => (
          <tr key={s._id} className="border-b border-[#151515] hover:bg-[#1A1A1A] transition-colors">
            <td className="px-3 py-3">
              <div className="text-[#E8E4DC] font-medium">{s.name}</div>
              <div className="text-[#555] text-[11px] mt-0.5 max-w-[200px] truncate">{s.description}</div>
            </td>
            <td className="px-3 py-3">
              <span className="bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded px-2 py-0.5 text-[11px] text-[#C9A84C]">
                {CATEGORY_LABELS_SHORT[s.category] || s.category}
              </span>
            </td>
            <td className="px-3 py-3 text-[#E8E4DC] font-medium">{s.price}</td>
            <td className="px-3 py-3 text-[#5A5A5A]">{s.pointsPrice || '—'}</td>
            <td className="px-3 py-3 text-[#5A5A5A]">{s.duration}</td>
            <td className="px-3 py-3">
              <span className={`rounded px-2 py-0.5 text-[11px] ${s.status === 'activo' ? 'bg-[#152A15] border border-[#205A20] text-[#8E8]' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#555]'}`}>
                {s.status}
              </span>
            </td>
            <td className="px-3 py-3">
              <div className="flex gap-1.5">
                <button onClick={() => onEdit(s)} className="flex items-center gap-1 px-2.5 py-1.5 bg-transparent border border-[#2A2A2A] text-[#AAA] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 rounded text-[12px] cursor-pointer transition-colors">
                  <i className="ti ti-edit text-[14px]" />
                </button>
                <button onClick={() => onDelete(s)} className="flex items-center gap-1 px-2.5 py-1.5 bg-transparent border border-[#2A2A2A] text-[#AAA] hover:text-[#E88] hover:border-[#5A2020] rounded text-[12px] cursor-pointer transition-colors">
                  <i className="ti ti-trash text-[14px]" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
