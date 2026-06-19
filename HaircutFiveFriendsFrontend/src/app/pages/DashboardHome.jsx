import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { useDashboardStats } from '../../features/auth/hooks/useDashboardStats.js';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
};

const STATUS_COLORS = {
  CONFIRMADO:  { bg: '#1A3A1A', text: '#5DBD5D', border: '#2A5A2A' },
  PENDIENTE:   { bg: '#3A2A0A', text: '#C9A84C', border: '#5A3A0A' },
  COMPLETADO:  { bg: '#0A2A3A', text: '#5ABDD0', border: '#0A4A5A' },
  CANCELADO:   { bg: '#3A0A0A', text: '#E07070', border: '#5A0A0A' },
};

/* ─── Gráfica de línea ────────────────────────────────────────────────────── */
function LineChart({ salesByDay }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !salesByDay?.length) return;
    const labels = salesByDay.map(d => d.label);
    const data   = salesByDay.map(d => d.total);

    const build = () => {
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 220);
      grad.addColorStop(0, 'rgba(201,168,76,0.25)');
      grad.addColorStop(1, 'rgba(201,168,76,0.00)');

      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data,
            borderColor: '#C9A84C',
            borderWidth: 2,
            backgroundColor: grad,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#C9A84C',
            pointBorderColor: '#111',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: ctx => ` Q${ctx.parsed.y.toFixed(0)}` },
              backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', borderWidth: 1,
              titleColor: '#FFFFFF', bodyColor: '#C9A84C', padding: 10,
            },
          },
          scales: {
            x: { ticks: { color: '#555', font: { size: 11 } }, grid: { color: '#1A1A1A' } },
            y: { ticks: { color: '#555', font: { size: 11 }, callback: v => `Q${v}` }, grid: { color: '#1A1A1A' }, beginAtZero: true },
          },
        },
      });
    };

    if (window.Chart) { build(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = build;
    document.head.appendChild(script);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [salesByDay]);

  return <div style={{ position: 'relative', height: '220px' }}><canvas ref={canvasRef} /></div>;
}

/* ─── Gráfica dona ────────────────────────────────────────────────────────── */
function DonutChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const colors = ['#A08030','#C9A84C','#4A8A4A','#8A2020'];
    const labels = (data || []).map(d => d.label);
    const values = (data || []).map(d => d.count);

    const build = () => {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#888', font: { size: 11 }, boxWidth: 10, padding: 14 } },
            tooltip: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', borderWidth: 1, titleColor: '#FFF', bodyColor: '#AAA' },
          },
          cutout: '68%',
        },
      });
    };

    if (window.Chart) { build(); return; }
    const t = setInterval(() => { if (window.Chart) { clearInterval(t); build(); } }, 100);
    return () => { clearInterval(t); if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return <div style={{ position: 'relative', height: '180px' }}><canvas ref={canvasRef} /></div>;
}

/* ─── Stat Card grande (estilo imagen) ───────────────────────────────────── */
function BigStatCard({ icon, label, value, sub, loading }) {
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #242424', borderRadius: '12px', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '52px', height: '52px', background: '#111', border: '1px solid #2A2A2A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#C9A84C', flexShrink: 0 }}>
        <i className={`ti ${icon}`} aria-hidden="true" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '34px', color: '#FFFFFF', lineHeight: 1, letterSpacing: '1px' }}>
          {loading ? '—' : (value ?? '—')}
        </div>
        {sub && <div style={{ fontSize: '12px', color: '#C9A84C', marginTop: '4px', fontWeight: 600 }}>{loading ? '' : sub}</div>}
      </div>
    </div>
  );
}

/* ─── Vista USUARIO ───────────────────────────────────────────────────────── */
function UserDashboard({ user, stats, loading }) {
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  const futureAppts = stats?.raw?.futureAppointments ?? [];

  const ACTIONS = [
    { label: 'Reservar cita',  icon: 'ti-calendar-plus',  to: '/client/reservar', badge: 'Nuevo' },
    { label: 'Mis citas',      icon: 'ti-calendar',       to: '/client/citas' },
    { label: 'Productos',      icon: 'ti-package',        to: '/client/productos' },
    { label: 'Mi perfil',      icon: 'ti-user-circle',    to: '/client/perfil' },
    { label: 'Servicios',      icon: 'ti-scissors',       to: '/client/servicios' },
    { label: 'Reseñas',        icon: 'ti-star',           to: '/client/resenas' },
  ];

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: '#FFF' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '32px', letterSpacing: '2px', margin: '0 0 4px', color: '#FFF' }}>
          Bienvenido, {firstName} 👋
        </h1>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Aquí tienes un resumen de tu cuenta.</p>
      </div>

      {/* Stats usuario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        <BigStatCard icon="ti-calendar" label="Próxima cita"      value={stats?.proximaCita ?? '—'} sub={stats?.proximaCitaHora ? `${stats.proximaCitaHora}${stats.proximaCitaBarbero ? ' · ' + stats.proximaCitaBarbero : ''}` : 'Sin citas pendientes'} loading={loading} />
        <BigStatCard icon="ti-history"  label="Total citas"       value={stats?.totalCitas ?? '—'} sub="Desde tu registro" loading={loading} />
        <BigStatCard icon="ti-star"     label="Puntos acumulados" value={stats?.puntos ?? '—'}     sub="Programa de lealtad" loading={loading} />
      </div>

      {/* Próximas citas */}
      {futureAppts.length > 0 && (
        <div style={{ background: '#1A1A1A', border: '1px solid #242424', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>Próximas citas</span>
            <span style={{ fontSize: '12px', color: '#C9A84C', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/client/citas')}>Ver todas →</span>
          </div>
          {futureAppts.slice(0, 4).map((a, i) => {
            const fecha = a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
            const hora  = a.appointmentDate ? new Date(a.appointmentDate).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '';
            const col   = STATUS_COLORS[a.status] || STATUS_COLORS.PENDIENTE;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < futureAppts.slice(0,4).length - 1 ? '1px solid #222' : 'none' }}>
                <div style={{ minWidth: '70px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9A84C' }}>{fecha}</div>
                  {hora && <div style={{ fontSize: '11px', color: '#555' }}>{hora}</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>{a.serviceId?.name || 'Servicio'}</div>
                  {a.barberId?.name && <div style={{ fontSize: '11px', color: '#777' }}>con {a.barberId.name}</div>}
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: col.bg, color: col.text, border: `1px solid ${col.border}`, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{a.status}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Acciones */}
      <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: '10px', fontWeight: 700 }}>Acciones rápidas</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px' }}>
        {ACTIONS.map(a => (
          <ActionCard key={a.to} {...a} onClick={() => navigate(a.to)} />
        ))}
      </div>
    </div>
  );
}

function ActionCard({ label, icon, badge, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      role="button" tabIndex={0}
      style={{ background: hov ? '#222' : '#1A1A1A', border: `1px solid ${hov ? '#C9A84C33' : '#242424'}`, borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
    >
      <div style={{ width: '34px', height: '34px', background: '#0F0F0F', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#C9A84C', flexShrink: 0 }}>
        <i className={`ti ${icon}`} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', flex: 1 }}>{label}</span>
      {badge && <span style={{ fontSize: '10px', background: '#C9A84C', color: '#000', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>{badge}</span>}
      <i className="ti ti-chevron-right" style={{ fontSize: '13px', color: '#333' }} />
    </div>
  );
}

/* ─── Dashboard ADMIN ─────────────────────────────────────────────────────── */
function AdminDashboard({ user, stats, loading, error }) {
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Administrador';
  const raw = stats?.raw || {};

  const Spinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '13px', padding: '2rem 0' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid #222', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      Cargando…
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: '#FFF', width: '100%' }}>
      {/* ── Encabezado ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '32px', letterSpacing: '2px', margin: '0 0 4px', color: '#FFF' }}>
          Bienvenido, {firstName} 👋
        </h1>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Aquí tienes un resumen general de tu barbería.</p>
      </div>

      {error && (
        <div style={{ background: '#1A0A0A', border: '1px solid #5A2020', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#E07070', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      {/* ── Row 1: 4 stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <BigStatCard icon="ti-calendar-event" label="Citas hoy"         value={stats?.citasHoy ?? '—'}        sub={new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'short' })} loading={loading} />
        <BigStatCard icon="ti-coin"           label="Ingresos hoy"      value={stats?.ingresosHoy ?? '—'}     sub="Ventas completadas" loading={loading} />
        <BigStatCard icon="ti-user-plus"      label="Nuevos clientes"   value={stats?.newClientsToday ?? '—'} sub="Registrados hoy" loading={loading} />
        <BigStatCard icon="ti-users"          label="Clientes totales"  value={stats?.clientesActivos ?? '—'} sub="Total registrados" loading={loading} />
      </div>

      {/* ── Row 2: Gráfica línea + Próximas citas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '12px', marginBottom: '12px' }}>

        {/* Gráfica de ingresos */}
        <div style={{ background: '#1A1A1A', border: '1px solid #242424', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>Ingresos</span>
            <span style={{ fontSize: '11px', color: '#555', background: '#111', border: '1px solid #222', borderRadius: '6px', padding: '4px 12px' }}>Últimos 7 días</span>
          </div>
          {loading ? <Spinner /> : <LineChart salesByDay={raw.salesByDay || []} />}
        </div>

        {/* Próximas citas */}
        <div style={{ background: '#1A1A1A', border: '1px solid #242424', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>Próximas citas</span>
            <span style={{ fontSize: '12px', color: '#C9A84C', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/dashboard/citas')}>Ver todas</span>
          </div>
          {loading ? <Spinner /> : (raw.upcomingAppointments || []).length === 0 ? (
            <div style={{ color: '#444', fontSize: '13px', padding: '1rem 0' }}>No hay citas para hoy</div>
          ) : (raw.upcomingAppointments || []).map((a, i, arr) => {
            const hora = a.appointmentDate ? new Date(a.appointmentDate).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '—';
            const col  = STATUS_COLORS[a.status] || STATUS_COLORS.PENDIENTE;
            const cliente = a.clientId?.name || 'Cliente';
            const servicio = a.serviceId?.name || 'Servicio';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#C9A84C', minWidth: '40px' }}>{hora}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#C9A84C18', border: '1px solid #C9A84C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#C9A84C', fontWeight: 700, flexShrink: 0 }}>
                  {cliente.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cliente}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{servicio}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: col.bg, color: col.text, border: `1px solid ${col.border}`, whiteSpace: 'nowrap', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{a.status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 3: Dona + Actividad reciente + Top productos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>

        {/* Dona: citas por estado */}
        <div style={{ background: '#1A1A1A', border: '1px solid #242424', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', marginBottom: '1rem' }}>Citas por estado</div>
          {loading ? <Spinner /> : <DonutChart data={raw.appointmentsByStatus || []} />}
          {!loading && (
            <div style={{ marginTop: '1rem' }}>
              {(raw.appointmentsByStatus || []).map(d => {
                const colors = ['#A08030','#C9A84C','#4A8A4A','#8A2020'];
                const idx = ['PENDIENTE','CONFIRMADO','COMPLETADO','CANCELADO'].indexOf(d.label);
                return (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx] || '#666', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#888', flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: '12px', color: '#FFF', fontWeight: 700 }}>{d.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div style={{ background: '#1A1A1A', border: '1px solid #242424', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', marginBottom: '1rem' }}>Actividad reciente</div>
          {loading ? <Spinner /> : (raw.recentActivity || []).length === 0 ? (
            <div style={{ color: '#444', fontSize: '13px' }}>Sin actividad reciente</div>
          ) : (raw.recentActivity || []).map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', background: '#111', border: '1px solid #1E1E1E', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: '#C9A84C', flexShrink: 0 }}>
                <i className={`ti ${a.icon}`} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#CCC', lineHeight: 1.4 }}>
                  {a.text}<span style={{ color: '#FFF', fontWeight: 700 }}>{a.bold}</span>
                </div>
                {a.score && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                    {Array.from({ length: 5 }, (_, j) => (
                      <i key={j} className="ti ti-star-filled" style={{ fontSize: '12px', color: j < a.score ? '#C9A84C' : '#333' }} />
                    ))}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{timeAgo(a.time)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Top productos */}
        <div style={{ background: '#1A1A1A', border: '1px solid #242424', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>Productos más vendidos</span>
            <span style={{ fontSize: '12px', color: '#C9A84C', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/dashboard/productos')}>Ver todos</span>
          </div>
          {loading ? <Spinner /> : (raw.topProducts || []).length === 0 ? (
            <div style={{ color: '#444', fontSize: '13px' }}>Sin datos de productos</div>
          ) : (raw.topProducts || []).map((p, i) => (
            <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#000', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ width: '38px', height: '38px', background: '#111', border: '1px solid #2A2A2A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {p.image ? (
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="ti ti-package" style={{ fontSize: '18px', color: '#444' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>{p.quantity ?? 0} unidades</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function DashboardHome() {
  const user  = useAuthStore((state) => state.user);
  const { stats, loading, error } = useDashboardStats();
  const role    = user?.role || 'USER_ROLE';
  const isAdmin = role === 'ADMIN_ROLE';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      {isAdmin
        ? <AdminDashboard user={user} stats={stats} loading={loading} error={error} />
        : <UserDashboard  user={user} stats={stats} loading={loading} />
      }
    </>
  );
}
