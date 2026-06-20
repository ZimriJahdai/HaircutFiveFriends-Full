import { useNavigate } from 'react-router-dom';
import FondoPrincipal from '../../assets/img/FondoPrincipal.png';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-start p-6"
      style={{ backgroundImage: `url(${FondoPrincipal})` }}
    >
      <div className="relative z-10 w-full max-w-[680px]">
        <div className="rounded-[36px] bg-black/70 border border-[#C9A84C]/15 p-10 md:p-14 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
          <div className="max-w-3xl text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-[#C9A84C] mb-4">
              Bienvenido a Haircut Five Friends
            </p>
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-[-0.04em]">
              ESTILO QUE TE DEFINE
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#E8E4DC]/85 leading-9">
              Más que un corte, una experiencia.
              Diseñamos tu estilo, potenciamos tu confianza.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="inline-flex items-center justify-center rounded-full bg-[#C9A84C] px-10 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#0A0A0A] transition hover:bg-[#d4b24b]"
            >
              Iniciar sesión
            </button>
            <p className="max-w-xl text-sm text-[#E8E4DC]/75 leading-7">
              Accede ahora para gestionar tus citas, ver tus servicios y recibir la mejor atención de barbería profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
