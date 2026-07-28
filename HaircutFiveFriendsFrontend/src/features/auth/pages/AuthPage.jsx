import { ArrowLeft, CalendarDays, Scissors, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FondoImage from '../../../assets/img/Fondo.png';
import { LoginForm } from '../components/LoginForm.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
import { ResendVerificationForm } from '../components/ResendVerificationForm.jsx';

const MAIN_TABS = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Registro' },
];

const SECONDARY_LABELS = {
  forgot: 'Recuperar contraseña',
  resend: 'Reenviar verificación',
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [prevTab, setPrevTab] = useState('login');

  const quickPoints = [
    {
      icon: CalendarDays,
      title: 'Organiza tus citas',
      description: 'Reserva, consulta horarios y mantén el control de tus próximas visitas.',
    },
    {
      icon: Scissors,
      title: 'Encuentra tu estilo',
      description: 'Explora servicios, cortes y atención pensada para tu imagen.',
    },
    {
      icon: ShieldCheck,
      title: 'Gestiona tu cuenta',
      description: 'Accede a favoritos, historial y funciones personalizadas en un solo lugar.',
    },
  ];

  const goTo = (tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const goBack = () => setActiveTab(prevTab);

  const isSecondary = activeTab === 'forgot' || activeTab === 'resend';

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${FondoImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.18),transparent_28%),linear-gradient(135deg,rgba(4,4,4,0.94)_0%,rgba(9,9,9,0.88)_48%,rgba(12,12,12,0.76)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center justify-center">
        <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1.05fr)_520px]">
          <section className="flex flex-col justify-between rounded-[36px] border border-white/8 bg-black/45 p-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10 lg:p-12">
            <div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#E8E4DC]/80 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={14} />
                Volver al inicio
              </button>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E7C66A]">
                <Sparkles size={14} />
                Acceso Haircut Five Friends
              </div>

              <div className="mt-6 max-w-2xl">
                <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Entra a tu cuenta
                  <span className="block text-[#E7C66A]">y gestiona tu experiencia</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-[#E8E4DC]/78 sm:text-lg">
                  Inicia sesión para reservar citas, revisar tu actividad y aprovechar una experiencia de barbería más organizada y personalizada.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              {quickPoints.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C9A84C]/16 text-[#E7C66A]">
                    <Icon size={20} />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/92">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#E8E4DC]/68">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[34px] border border-[#C9A84C]/18 bg-[#111111]/92 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div className="border-b border-[#C9A84C]/14 px-6 py-6 sm:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#E7C66A]">Tu acceso</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-['Bebas_Neue',sans-serif] text-4xl leading-none tracking-[0.16em] text-[#F4F0E8]">
                    Haircut Five Friends
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#9D978C]">
                    Inicia sesión o crea tu cuenta para continuar.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#E8E4DC]/70">
                  {isSecondary ? SECONDARY_LABELS[activeTab] : 'Acceso principal'}
                </div>
              </div>
            </div>

            {isSecondary ? (
              <div className="flex items-center gap-3 border-b border-[#C9A84C]/14 bg-[#C9A84C]/[0.04] px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A84C] transition hover:bg-[#C9A84C]/10 hover:text-[#E8E4DC]"
                >
                  <ArrowLeft size={14} />
                  Volver
                </button>
                <span className="text-sm text-[#8A8378]">Continúa con la acción seleccionada.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 border-b border-[#C9A84C]/14 bg-[#0E0E0E] px-3 py-3 sm:px-4">
                {MAIN_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => goTo(tab.key)}
                    className={[
                      'rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition focus:outline-none',
                      activeTab === tab.key
                        ? 'bg-[#C9A84C] text-[#0A0A0A] shadow-[0_10px_30px_rgba(201,168,76,0.2)]'
                        : 'text-[#8A8378] hover:bg-white/[0.04] hover:text-[#E8E4DC]',
                    ].join(' ')}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {activeTab === 'login' && <LoginForm onChangeTab={goTo} />}
              {activeTab === 'register' && <RegisterForm onRegistered={() => goTo('login')} onChangeTab={goTo} />}
              {activeTab === 'forgot' && <ForgotPasswordForm />}
              {activeTab === 'resend' && <ResendVerificationForm />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
