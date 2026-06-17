import { Link } from 'react-router-dom';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v5" />
  </svg>
);

const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M9 9h.01M15 9h.01M9 15c1 1 5 1 6 0" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2L7 14.2 2 9.4l7-.9z" />
  </svg>
);

const SparkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export default function Dashboard() {
  return (
    <section className="page">
      <div className="page-head">
        <h1>Resumen general</h1>
        <p>Supervisa los modulos activos, accesos rapidos y el estado del backend.</p>
      </div>

      <div className="bento">
        <Link to="/chat" className="bento-tile is-hero">
          <div className="tile-icon"><SparkIcon /></div>
          <div>
            <span className="tile-eyebrow">Suite IA / barberia</span>
            <h2 className="tile-title">Inteligencia que corta fino.</h2>
            <p className="tile-desc">
              Chat, voz, vision y resenas potenciadas por Gemini, conectadas al nucleo de HaircutFiveFriends.
            </p>
          </div>
          <div className="hero-stats">
            <span className="hero-stat"><b>4</b> modulos</span>
            <span className="hero-stat"><b>2.5</b> Flash</span>
            <span className="hero-stat"><b>live</b> voz real</span>
          </div>
        </Link>

        <Link to="/chat" className="bento-tile is-mini">
          <div className="tile-icon"><ChatIcon /></div>
          <span className="tile-eyebrow">01 / chat</span>
          <h3 className="tile-title">Chat operativo</h3>
          <p className="tile-desc">Consultas y citas con Gemini 2.5 Flash.</p>
          <span className="tile-cta">Abrir chat <ArrowIcon /></span>
        </Link>

        <Link to="/voice" className="bento-tile is-tall">
          <div className="tile-icon"><MicIcon /></div>
          <span className="tile-eyebrow">02 / voz</span>
          <h3 className="tile-title">Voz en tiempo real</h3>
          <p className="tile-desc">Live API lista para streaming y transcripcion bidireccional.</p>
          <span className="tile-cta">Configurar voz <ArrowIcon /></span>
        </Link>

        <Link to="/vision" className="bento-tile is-wide">
          <div className="tile-icon"><ScanIcon /></div>
          <span className="tile-eyebrow">03 / vision</span>
          <h3 className="tile-title">Vision facial</h3>
          <p className="tile-desc">Analisis de rostro y recomendacion de cortes conectada al backend.</p>
          <span className="tile-cta">Probar vision <ArrowIcon /></span>
        </Link>

        <Link to="/reviews" className="bento-tile is-mini">
          <div className="tile-icon"><StarIcon /></div>
          <span className="tile-eyebrow">04 / resenas</span>
          <h3 className="tile-title">Resenas</h3>
          <p className="tile-desc">Insights por barbero y tendencias.</p>
          <span className="tile-cta">Ver reportes <ArrowIcon /></span>
        </Link>
      </div>
    </section>
  );
}
