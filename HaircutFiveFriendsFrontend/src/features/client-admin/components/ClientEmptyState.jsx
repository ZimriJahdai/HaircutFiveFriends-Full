/**
 * ClientEmptyState
 * variant: 'loading' | 'empty'
 * onAdd: callback shown in the 'empty' variant
 */
export const ClientEmptyState = ({ variant, onAdd }) => {
  if (variant === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-[13px]">
        <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
        <span>Cargando clientes…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3.5 py-16 text-[#5A5A5A] text-[14px] text-center">
      <i className="ti ti-users text-5xl text-[#333]" aria-hidden="true" />
      <h3 className="m-0 text-[#E8E4DC] text-[16px] font-semibold">No hay clientes registrados</h3>
      <p className="m-0 text-[#5A5A5A] text-[13px]">Agrega tu primer cliente para empezar</p>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors mt-2 focus:outline-none"
      >
        <i className="ti ti-plus text-[16px]" aria-hidden="true" />
        Crear Cliente
      </button>
    </div>
  );
};
