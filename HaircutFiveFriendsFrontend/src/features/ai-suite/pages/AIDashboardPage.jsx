import { Link } from 'react-router-dom';
import NavbarClient from '../../client/components/NavbarClient.jsx';

const CARDS = [
  {
    title: 'Chat IA',
    desc: 'Asistente conversacional para dudas rápidas y apoyo en operaciones.',
    to: '/client/ia/chat',
    icon: 'ti ti-message-chatbot',
  },
  {
    title: 'Visión IA',
    desc: 'Recomendación de corte por imagen y análisis de rasgos faciales.',
    to: '/client/probar-corte',
    icon: 'ti ti-camera-search',
  },
  {
    title: 'Voz IA',
    desc: 'Interacción por voz en tiempo real con el servicio Gemini Live.',
    to: '/client/ia/voz',
    icon: 'ti ti-microphone',
  },
  {
    title: 'Análisis de reseñas',
    desc: 'Insights automáticos para evaluar desempeño y percepción del cliente.',
    to: '/client/ia/resenas',
    icon: 'ti ti-chart-dots-3',
  },
];

export function AIDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <NavbarClient />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="font-['Bebas_Neue'] text-4xl tracking-wider text-white">Centro IA</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Módulos de inteligencia artificial integrados al mismo frontend del proyecto.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="rounded-2xl border border-white/10 bg-[#111] p-6 hover:border-[#00D2C4]/40 hover:bg-[#141414] transition-colors"
            >
              <div className="w-11 h-11 rounded-xl border border-[#00D2C4]/30 bg-[#00D2C4]/10 text-[#00D2C4] flex items-center justify-center mb-4">
                <i className={`${card.icon} text-xl`} />
              </div>
              <h2 className="text-xl font-semibold text-white">{card.title}</h2>
              <p className="text-sm text-zinc-400 mt-2 leading-6">{card.desc}</p>
              <span className="inline-flex items-center gap-2 text-[#00D2C4] text-sm font-semibold mt-4">
                Abrir módulo
                <i className="ti ti-arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
