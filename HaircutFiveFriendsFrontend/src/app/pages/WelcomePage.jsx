import { ArrowRight, CalendarDays, Scissors, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FondoPrincipal from '../../assets/img/FondoPrincipal.png';

export default function WelcomePage() {
  const navigate = useNavigate();

  const trustPoints = [
    { icon: CalendarDays, label: 'Reservas simples', value: 'Agenda rápida y clara' },
    { icon: Scissors, label: 'Estilo profesional', value: 'Servicios y cortes destacados' },
    { icon: ShieldCheck, label: 'Atención confiable', value: 'Seguimiento de tu experiencia' },
  ];

  const servicePills = ['Cortes premium', 'Barberos expertos', 'Gestión de citas', 'Experiencias IA'];

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${FondoPrincipal})` }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(201,168,76,0.22),transparent_32%),linear-gradient(90deg,rgba(3,3,3,0.92)_0%,rgba(3,3,3,0.78)_42%,rgba(3,3,3,0.18)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-8 xl:grid-cols-[minmax(0,1.15fr)_380px]">
          <section className="rounded-[36px] border border-[#C9A84C]/15 bg-black/70 p-8 text-white shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-10 lg:p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E7C66A]">
              <Sparkles size={14} />
              Bienvenido a Haircut Five Friends
            </div>

            <div className="mt-6 max-w-4xl">
              <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-7xl">
                Tu próxima imagen
                <span className="block text-[#E7C66A]">empieza antes del corte</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#E8E4DC]/85 sm:text-lg lg:text-xl">
                Agenda, descubre servicios, encuentra a tu barbero ideal y vive una experiencia más completa desde el primer clic.
                Esta plataforma reúne atención profesional, organización de citas y herramientas para definir mejor tu estilo.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {servicePills.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-[#F1ECE2] backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {trustPoints.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C9A84C]/16 text-[#E7C66A]">
                    <Icon size={20} />
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/92">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-[#E8E4DC]/72">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#0A0A0A] transition hover:bg-[#d8b85b]"
                >
                  Iniciar sesión
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
                >
                  Reservar experiencia
                </button>
              </div>
            </div>
          </section>

          <aside className="flex flex-col justify-between rounded-[32px] border border-[#C9A84C]/18 bg-[linear-gradient(180deg,rgba(14,14,14,0.86),rgba(5,5,5,0.92))] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E7C66A]">Por qué empezar aquí</p>
              <h2 className="mt-4 text-2xl font-bold leading-tight">Una bienvenida que explica mejor lo que puedes hacer.</h2>
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E7C66A]">Experiencia destacada</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-3xl font-black tracking-[-0.04em]">01</p>
                  <p className="mt-2 text-sm leading-6 text-[#E8E4DC]/74">Explora propuestas de corte y servicios antes de reservar.</p>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <p className="text-3xl font-black tracking-[-0.04em]">02</p>
                  <p className="mt-2 text-sm leading-6 text-[#E8E4DC]/74">Accede a tu cuenta para gestionar citas, favoritos y seguimiento.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-black text-[#E7C66A]">4</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/80">Áreas clave</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-black text-[#E7C66A]">1</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/80">Acceso central</p>
              </div>
            </div>
          </aside>
          </div>
      </div>
    </div>
  );
}
