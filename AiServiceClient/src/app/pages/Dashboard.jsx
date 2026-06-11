export default function Dashboard() {
  return (
    <section className="page">
      <div className="page-head">
        <h1>Resumen general</h1>
        <p>
          Supervisa los modulos activos, accesos rapidos y el estado del backend.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Chat operativo</h3>
          <p>Gemini 2.5 Flash activo para consultas y citas.</p>
          <button className="ghost-button" type="button" >Abrir chat</button>
        </div>
        <div className="card">
          <h3>Voz en tiempo real</h3>
          <p>Live API lista para streaming y transcripcion.</p>
          <button className="ghost-button" type="button">Configurar voz</button>
        </div>
        <div className="card">
          <h3>Vision facial</h3>
          <p>Endpoint de analisis conectado a HaircutFiveFriends.</p>
          <button className="ghost-button" type="button">Probar vision</button>
        </div>
        <div className="card">
          <h3>Resenas</h3>
          <p>Insights por barbero y tendencias de servicio.</p>
          <button className="ghost-button" type="button">Ver reportes</button>
        </div>
      </div>
    </section>
  );
}
