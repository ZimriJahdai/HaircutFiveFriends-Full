import { useNavigate } from 'react-router-dom';
import NavbarClient from '../components/NavbarClient.jsx';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {/* Horizontal Navbar */}
      <NavbarClient />

      {/* Main Hero & Features container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8 flex flex-col justify-between">

        {/* Hero Content */}
        <div className="flex-1 flex flex-col justify-center max-w-[650px] py-12 md:py-16">
          <h1 className="font-['Bebas_Neue',sans-serif] text-5xl sm:text-6xl md:text-7xl tracking-[2px] leading-tight mb-4 select-none">
            TU ESTILO,<br />
            <span className="text-[#00D2C4] font-extrabold drop-shadow-[0_2px_10px_rgba(0,210,196,0.15)]">
              NUESTRA PASIÓN
            </span>
          </h1>
          <p className="text-[#9E9E9E] text-[15px] sm:text-[16px] max-w-[480px] leading-relaxed mb-8">
            Más que un corte, transformamos tu imagen y elevamos tu confianza.
          </p>

          <div>
            <button
              onClick={() => navigate('/client/reservar')}
              className="flex items-center gap-2 bg-[#00D2C4] hover:bg-[#00B4A8] text-[#0A0A0A] font-semibold text-[14px] px-6 py-3.5 rounded-lg transition-all duration-200 shadow-[0_4px_20px_rgba(0,210,196,0.25)] hover:shadow-[0_6px_25px_rgba(0,210,196,0.4)] focus:outline-none cursor-pointer transform hover:-translate-y-0.5"
            >
              RESERVAR MI CITA
              <i className="ti ti-chevron-right text-[16px]" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#1E1E1E]">

          {/* Feature 1 */}
          <div className="flex items-center gap-4 group">
            <div className="bg-[#00D2C4]/10 border border-[#00D2C4]/20 rounded-xl p-3.5 flex items-center justify-center text-[#00D2C4] transition-all duration-200 group-hover:bg-[#00D2C4]/20 group-hover:border-[#00D2C4]/40">
              <i className="ti ti-id-badge text-2xl" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold tracking-[0.5px] text-[#E8E4DC] mb-0.5 uppercase">
                Barberos Expertos
              </h3>
              <p className="text-[12px] text-[#5A5A5A]">Profesionales con experiencia</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-4 group">
            <div className="bg-[#00D2C4]/10 border border-[#00D2C4]/20 rounded-xl p-3.5 flex items-center justify-center text-[#00D2C4] transition-all duration-200 group-hover:bg-[#00D2C4]/20 group-hover:border-[#00D2C4]/40">
              <i className="ti ti-sparkles text-2xl" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold tracking-[0.5px] text-[#E8E4DC] mb-0.5 uppercase">
                Atención Personalizada
              </h3>
              <p className="text-[12px] text-[#5A5A5A]">Tu estilo, nuestra prioridad</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-4 group">
            <div className="bg-[#00D2C4]/10 border border-[#00D2C4]/20 rounded-xl p-3.5 flex items-center justify-center text-[#00D2C4] transition-all duration-200 group-hover:bg-[#00D2C4]/20 group-hover:border-[#00D2C4]/40">
              <i className="ti ti-shield-check text-2xl" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold tracking-[0.5px] text-[#E8E4DC] mb-0.5 uppercase">
                Productos Premium
              </h3>
              <p className="text-[12px] text-[#5A5A5A]">Solo trabajamos con lo mejor</p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
