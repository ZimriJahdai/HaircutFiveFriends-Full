import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page">
      <div className="page-head">
        <h1>Ruta no encontrada</h1>
        <p>La vista que buscas no existe.</p>
      </div>
      <div className="card">
        <p>Regresa al resumen para continuar.</p>
        <Link className="ghost-button" to="/">Volver al inicio</Link>
      </div>
    </section>
  );
}
