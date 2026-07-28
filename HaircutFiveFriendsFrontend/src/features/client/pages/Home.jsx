import { ArrowRight, CalendarDays, Scissors, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import NavbarClient from '../components/NavbarClient.jsx';

export const Home = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const firstName = user?.name?.split(' ')?.[0] || 'Cliente';

  const quickLinks = [
    {
      icon: CalendarDays,
      title: 'Reservar cita',
      description: 'Agenda tu próxima visita sin salir de tu cuenta.',
      to: '/client/reservar',
    },
    {
      icon: Scissors,
      title: 'Ver servicios',
      description: 'Consulta cortes, estilos y opciones disponibles.',
      to: '/client/servicios',
    },
    {
      icon: UserRound,
      title: 'Explorar barberos',
      description: 'Encuentra al profesional que mejor encaja contigo.',
      to: '/client/barberos',
    },
  ];

  const trustPoints = [
    {
      icon: ShieldCheck,
      title: 'Barberos Expertos',
      description: 'Profesionales con experiencia',
    },
    {
      icon: Sparkles,
      title: 'Atención Personalizada',
      description: 'Tu estilo, nuestra prioridad',
    },
    {
      icon: Scissors,
      title: 'Productos Premium',
      description: 'Solo trabajamos con lo mejor',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8 lg:px-8 flex flex-col gap-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
          <div className="relative overflow-hidden rounded-[30px] border border-white/6 bg-[linear-gradient(145deg,rgba(10,10,10,0.98),rgba(15,15,15,0.9))] px-8 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,210,196,0.14),transparent_30%)]" />
            <div className="relative z-10 max-w-[720px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00D2C4]/20 bg-[#00D2C4]/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5FEADF]">
                <Sparkles size={14} />
                Bienvenido de nuevo
              </div>

              <h1 className="mt-6 font-['Bebas_Neue',sans-serif] text-5xl sm:text-6xl md:text-7xl tracking-[2px] leading-[0.95] select-none">
                {firstName.toUpperCase()}, TU ESTILO
                <span className="block text-[#00D2C4] font-extrabold drop-shadow-[0_2px_10px_rgba(0,210,196,0.15)]">
                  SIGUE AQUÍ
                </span>
              </h1>

              <p className="mt-6 text-[#9E9E9E] text-[15px] sm:text-[16px] max-w-[560px] leading-8">
                Reserva tu próxima cita, revisa servicios y encuentra a tu barbero ideal desde un inicio más útil y claro.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/client/reservar')}
                  className="inline-flex items-center gap-2 bg-[#00D2C4] hover:bg-[#00B4A8] text-[#0A0A0A] font-semibold text-[14px] px-6 py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(0,210,196,0.25)] hover:shadow-[0_6px_25px_rgba(0,210,196,0.4)] focus:outline-none cursor-pointer transform hover:-translate-y-0.5"
                >
                  RESERVAR MI CITA
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/client/servicios')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-[14px] font-semibold text-[#E8E4DC] transition-colors hover:bg-white/[0.07]"
                >
                  VER SERVICIOS
                </button>
              </div>
            </div>
          </div>

          <aside className="rounded-[30px] border border-white/6 bg-[#101010] p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5FEADF]">Accesos rápidos</p>
            <div className="mt-5 space-y-3">
              {quickLinks.map(({ icon: Icon, title, description, to }) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => navigate(to)}
                  className="flex w-full items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-left transition-all hover:border-[#00D2C4]/20 hover:bg-white/[0.05]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00D2C4]/10 text-[#00D2C4]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-[13px] font-bold tracking-[0.08em] text-[#E8E4DC] uppercase">{title}</h2>
                    <p className="mt-1 text-[13px] leading-6 text-[#7E7E7E]">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/6 bg-[#101010] p-5 group">
              <div className="bg-[#00D2C4]/10 border border-[#00D2C4]/20 rounded-xl p-3.5 flex items-center justify-center text-[#00D2C4] transition-all duration-200 group-hover:bg-[#00D2C4]/20 group-hover:border-[#00D2C4]/40">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold tracking-[0.5px] text-[#E8E4DC] mb-0.5 uppercase">
                  {title}
                </h3>
                <p className="text-[12px] text-[#5A5A5A]">{description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
