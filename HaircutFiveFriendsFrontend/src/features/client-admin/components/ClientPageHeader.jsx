export const ClientPageHeader = ({ onAdd }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
    <div>
      <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0 mb-1 leading-none">
        Clientes
      </h1>
      <p className="text-[13px] text-[#5A5A5A] m-0">Gestiona los clientes registrados en la barbería.</p>
    </div>
    <button
      type="button"
      onClick={onAdd}
      className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none"
    >
      <i className="ti ti-plus text-[16px]" aria-hidden="true" />
      Agregar cliente
    </button>
  </div>
);
