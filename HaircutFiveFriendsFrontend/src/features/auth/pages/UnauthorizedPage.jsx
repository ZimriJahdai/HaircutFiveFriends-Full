import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#0A0A0A] font-sans">
      <div className="w-full max-w-[480px] bg-[#111111] border border-[#C9A84C]/20 rounded-2xl overflow-hidden shadow-[0_14px_60px_rgba(0,0,0,0.6)]">

        {/* Card */}
        <div className="px-8 py-10 flex flex-col items-center gap-5 text-center">
          <i className="ti ti-lock-off text-6xl text-[#333]" aria-hidden="true" />
          <div>
            <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] mb-1 leading-none">
              Acceso denegado
            </h1>
            <p className="text-[13px] text-[#5A5A5A] m-0">
              No tienes permiso para ingresar a esta sección.
            </p>
          </div>

          <div className="h-[1px] bg-[#C9A84C]/20 w-full" />

          <button
            type="button"
            className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-lg px-5 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
            onClick={() => navigate('/auth')}
          >
            <i className="ti ti-arrow-left text-[15px]" aria-hidden="true" />
            Volver al login
          </button>
        </div>
      </div>
    </div>
  );
};
