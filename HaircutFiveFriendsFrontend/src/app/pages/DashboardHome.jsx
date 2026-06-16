import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { useDashboardStats } from '../../features/auth/hooks/useDashboardStats.js';

const ACTIONS_CONFIG = {
  ADMIN_ROLE: [
    { label: 'Ver todas las citas', icon: 'ti-calendar-event', to: '/dashboard/citas' },
    { label: 'Gestionar barberos', icon: 'ti-id-badge', to: '/dashboard/barberos' },
    { label: 'Productos', icon: 'ti-package', to: '/dashboard/productos' },
    { label: 'Clientes', icon: 'ti-users', to: '/dashboard/clientes' },
    { label: 'Servicios', icon: 'ti-scissors', to: '/dashboard/servicios' },
    { label: 'Reseñas', icon: 'ti-star', to: '/dashboard/resenas' },
  ],
  USER_ROLE: [
    { label: 'Reservar cita', icon: 'ti-calendar-plus', to: '/client/reservar' },
    { label: 'Productos', icon: 'ti-package', to: '/client/productos' },
    { label: 'Mis citas', icon: 'ti-list', to: '/client/citas' },
    { label: 'Mi perfil', icon: 'ti-user-circle', to: '/client/perfil' },
    { label: 'Servicios', icon: 'ti-scissors', to: '/client/servicios' },
    { label: 'Reseñas', icon: 'ti-star', to: '/client/resenas' },
  ],
};

const s = {
  wrapper: { fontFamily: "'Inter', sans-serif", color: '#E8E4DC', maxWidth: '1100px' },
  pageTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', letterSpacing: '3px', color: '#E8E4DC', margin: '0 0 4px 0', lineHeight: 1 },
  pageSubtitle: { fontSize: '13px', color: '#5A5A5A', margin: '0 0 1.5rem 0' },
  divider: { height: '1px', background: '#C9A84C22', margin: '0 0 1.5rem 0' },
  sectionLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#5A5A5A', margin: '0 0 10px 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginBottom: '2rem' },
  statCard: { background: '#1A1A1A', borderLeft: '3px solid #C9A84C', borderRadius: '0 8px 8px 0', padding: '14px 16px' },
  statTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' },
  statLabel: { fontSize: '11px', color: '#5A5A5A', letterSpacing: '0.3px' },
  statIcon: { fontSize: '16px', color: '#C9A84C', opacity: 0.5 },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '1px', color: '#E8E4DC', lineHeight: 1 },
  statSub: { fontSize: '11px', color: '#444', marginTop: '4px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '2rem' },
  actionIcon: { width: '34px', height: '34px', background: '#0F0F0F', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color: '#C9A84C', flexShrink: 0 },
  errorBox: { background: '#1A1A1A', border: '1px solid #C9A84C33', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: '#C9A84C', marginBottom: '1.5rem' },
};

function StatCard({ label, value, icon, sub, loading }) {
  return (
    <div style={s.statCard}>
      <div style={s.statTop}>
        <span style={s.statLabel}>{label}</span>
        <i className={`ti ${icon}`} style={s.statIcon} aria-hidden="true" />
      </div>
      <div style={s.statValue}>{loading ? '—' : (value ?? '—')}</div>
      {sub && <div style={s.statSub}>{loading ? '' : sub}</div>}
    </div>
  );
}

function ActionCard({ label, icon, to }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      role="button" tabIndex={0}
      style={{ background: hovered ? '#222' : '#1A1A1A', border: `1px solid ${hovered ? '#C9A84C44' : '#2A2A2A'}`, borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}
      onClick={() => navigate(to)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(to)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.actionIcon}><i className={`ti ${icon}`} aria-hidden="true" /></div>
      <span style={{ fontSize: '13px', fontWeight: 500, color: '#E8E4DC' }}>{label}</span>
      <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', fontSize: '13px', color: '#3A3A3A' }} aria-hidden="true" />
    </div>
  );
}

// Gráfica de barras de ventas por día (últimos 7 días)
function MiniBarChart({ sales }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !sales?.length) return;

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const labels = days.map(d => d.toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric' }));
    const data = days.map(d => {
      const dateStr = d.toISOString().split('T')[0];
      return sales
        .filter(s => s.status === 'COMPLETADO' && s.createdAt?.startsWith(dateStr))
        .reduce((acc, s) => acc + (s.total || 0), 0);
    });

    const build = () => {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: data.map((_, i) => i === 6 ? '#C9A84C' : '#C9A84C44'),
            borderRadius: 3,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: {
            callbacks: { label: ctx => `Q${ctx.parsed.y.toFixed(0)}` },
            backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', borderWidth: 1,
            titleColor: '#E8E4DC', bodyColor: '#AAA',
          }},
          scales: {
            x: { ticks: { color: '#555', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#555', font: { size: 10 }, callback: v => `Q${v}` }, grid: { color: '#1A1A1A' }, beginAtZero: true },
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
  }, [sales]);

  return (
    <div style={{ position: 'relative', height: '160px' }}>
      <canvas ref={canvasRef} role="img" aria-label="Gráfica de ingresos por día últimos 7 días">
        Ingresos diarios últimos 7 días
      </canvas>
    </div>
  );
}

// Gráfica de dona: distribución de citas por estado
function DonutChart({ appointments }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const statuses = ['PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO'];
    const colors   = ['#A08030', '#C9A84C', '#4A8A4A', '#8A2020'];
    const counts   = statuses.map(s => (appointments || []).filter(a => a.status === s).length);

    const build = () => {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'doughnut',
        data: {
          labels: statuses,
          datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#777', font: { size: 11 }, boxWidth: 10, padding: 12 } },
            tooltip: {
              backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', borderWidth: 1,
              titleColor: '#E8E4DC', bodyColor: '#AAA',
            },
          },
          cutout: '65%',
        },
      });
    };

    if (window.Chart) { build(); return; }
    const t = setInterval(() => { if (window.Chart) { clearInterval(t); build(); } }, 100);
    return () => { clearInterval(t); if (chartRef.current) chartRef.current.destroy(); };
  }, [appointments]);

  return (
    <div style={{ position: 'relative', height: '160px' }}>
      <canvas ref={canvasRef} role="img" aria-label="Gráfica de distribución de citas por estado">
        Distribución de citas por estado
      </canvas>
    </div>
  );
}

// Tabs de administrador
const ADMIN_TABS = [
  { key: 'resumen', label: 'Resumen', icon: 'ti-layout-dashboard' },
  { key: 'graficas', label: 'Gráficas', icon: 'ti-chart-bar' },
  { key: 'acciones', label: 'Acciones', icon: 'ti-bolt' },
];

export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);
  const { stats, loading, error } = useDashboardStats();
  const [tab, setTab] = useState('resumen');

  const role = user?.role || 'USER_ROLE';
  const actions = ACTIONS_CONFIG[role] || ACTIONS_CONFIG.USER_ROLE;
  const isAdmin = role === 'ADMIN_ROLE';

  const greeting = isAdmin ? 'Panel de Administración' : 'Mi Espacio';
  const subtitle = user?.name
    ? `Hola, ${user.name.split(' ')[0]}. ${isAdmin ? 'Aquí está el resumen de hoy.' : 'Bienvenido de vuelta.'}`
    : isAdmin ? 'Gestiona tu barbería desde aquí.' : 'Bienvenido a Five Friends.';

  const statCards = isAdmin
    ? [
        { label: 'Citas hoy', value: stats?.citasHoy ?? '—', icon: 'ti-calendar', sub: new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'short' }) },
        { label: 'Clientes activos', value: stats?.clientesActivos ?? '—', icon: 'ti-users', sub: 'Total registrados' },
        { label: 'Ingresos del mes', value: stats?.ingresosMes ?? '—', icon: 'ti-coin', sub: new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' }) },
        { label: 'Barberos', value: stats?.totalBarberos ?? '—', icon: 'ti-scissors', sub: 'En plantilla' },
      ]
    : [
        { label: 'Próxima cita', value: stats?.proximaCita ?? '—', icon: 'ti-calendar', sub: stats?.proximaCitaHora ? `${stats.proximaCitaHora}${stats.proximaCitaBarbero ? ` — ${stats.proximaCitaBarbero}` : ''}` : 'Sin citas pendientes' },
        { label: 'Total de citas', value: stats?.totalCitas ?? '—', icon: 'ti-history', sub: 'Desde tu registro' },
        { label: 'Puntos acumulados', value: stats?.puntos ?? '—', icon: 'ti-star', sub: 'Programa de lealtad' },
      ];

  return (
    <div style={s.wrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <h1 style={s.pageTitle}>{greeting}</h1>
      <p style={s.pageSubtitle}>{subtitle}</p>
      <div style={s.divider} />

      {error && (
        <div style={s.errorBox}>
          <i className="ti ti-alert-circle" style={{ marginRight: '8px' }} aria-hidden="true" />
          No se pudo cargar parte de la información: {error}
        </div>
      )}

      {/* Tabs solo para admin */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '2px', marginBottom: '1.5rem', background: '#111', borderRadius: '8px', padding: '4px', border: '1px solid #1E1E1E', width: 'fit-content' }}>
          {ADMIN_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '6px', border: 'none',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                background: tab === t.key ? '#C9A84C18' : 'transparent',
                color: tab === t.key ? '#E8E4DC' : '#777',
              }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: '14px' }} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* TAB: Resumen (o vista cliente) */}
      {(!isAdmin || tab === 'resumen') && (
        <>
          <p style={s.sectionLabel}>Resumen</p>
          <div style={s.statsGrid}>
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} loading={loading} />
            ))}
          </div>
          {!isAdmin && (
            <>
              <p style={s.sectionLabel}>Acciones rápidas</p>
              <div style={s.actionsGrid}>
                {actions.map((action) => <ActionCard key={action.to} {...action} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* TAB: Gráficas (solo admin) */}
      {isAdmin && tab === 'graficas' && (
        <>
          <p style={s.sectionLabel}>Análisis visual</p>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '3rem', color: '#5A5A5A', fontSize: '13px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #2A2A2A', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Cargando datos…
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '1.5rem' }}>
              <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '1.25rem', gridColumn: 'span 2' }}>
                <p style={{ margin: '0 0 1rem', fontSize: '10px', color: '#5A5A5A', letterSpacing: '2px', textTransform: 'uppercase' }}>Ingresos — últimos 7 días</p>
                <MiniBarChart sales={stats?.raw?.sales || []} />
              </div>
              <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '1.25rem' }}>
                <p style={{ margin: '0 0 1rem', fontSize: '10px', color: '#5A5A5A', letterSpacing: '2px', textTransform: 'uppercase' }}>Estado de citas de hoy</p>
                <DonutChart appointments={stats?.raw?.appointmentsToday || []} />
              </div>
              <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '1.25rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '10px', color: '#5A5A5A', letterSpacing: '2px', textTransform: 'uppercase' }}>Top clientes registrados</p>
                {(stats?.raw?.clients || []).slice(0, 5).map((c, i) => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#333', width: '14px', textAlign: 'right' }}>{i + 1}</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C9A84C22', border: '1px solid #C9A84C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#C9A84C', fontWeight: 500, flexShrink: 0 }}>
                      {c.name?.slice(0, 2).toUpperCase() || 'CL'}
                    </div>
                    <span style={{ fontSize: '12px', color: '#AAA' }}>{c.name || 'Cliente'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#555' }}>{c.email || ''}</span>
                  </div>
                ))}
                {!(stats?.raw?.clients?.length) && <p style={{ color: '#333', fontSize: '12px', margin: 0 }}>Sin datos</p>}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB: Acciones (solo admin) */}
      {isAdmin && tab === 'acciones' && (
        <>
          <p style={s.sectionLabel}>Acciones rápidas</p>
          <div style={s.actionsGrid}>
            {actions.map((action) => <ActionCard key={action.to} {...action} />)}
          </div>
        </>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
