import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { useDashboardStats } from '../../features/auth/hooks/useDashboardStats.js';

const ACTIONS_CONFIG = {
  ADMIN_ROLE: [
    { label: 'Ver todas las citas', icon: 'ti-calendar-event', to: '/dashboard/citas' },
    { label: 'Gestionar barberos', icon: 'ti-id-badge', to: '/dashboard/barberos' },
    { label: 'Productos', icon: 'ti-package', to: '/dashboard/productos' },
    { label: 'Clientes', icon: 'ti-users', to: '/dashboard/clientes' },
    { label: 'Reportes', icon: 'ti-chart-bar', to: '/dashboard/reportes' },
  ],
  USER_ROLE: [
    { label: 'Reservar cita', icon: 'ti-calendar-plus', to: '/client/reservar' },
    { label: 'Productos', icon: 'ti-package', to: '/client/productos' },
    { label: 'Mis citas', icon: 'ti-list', to: '/client/citas' },
    { label: 'Mi perfil', icon: 'ti-user-circle', to: '/client/perfil' },
    { label: 'Servicios', icon: 'ti-scissors', to: '/client/servicios' },
  ],
};

const s = {
  wrapper: { fontFamily: "'Inter', sans-serif", color: '#E8E4DC', maxWidth: '1000px' },
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
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginBottom: '2rem' },
  actionIcon: { width: '34px', height: '34px', background: '#0F0F0F', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color: '#C9A84C', flexShrink: 0 },
  actionLabel: { fontSize: '13px', fontWeight: 500 },
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
      role="button"
      tabIndex={0}
      style={{ background: hovered ? '#222' : '#1A1A1A', border: `1px solid ${hovered ? '#C9A84C44' : '#2A2A2A'}`, borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}
      onClick={() => navigate(to)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(to)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.actionIcon}><i className={`ti ${icon}`} aria-hidden="true" /></div>
      <span style={s.actionLabel}>{label}</span>
      <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', fontSize: '13px', color: '#3A3A3A' }} aria-hidden="true" />
    </div>
  );
}

export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);
  const { stats, loading, error } = useDashboardStats();

  const role = user?.role || 'USER_ROLE';
  const actions = ACTIONS_CONFIG[role] || ACTIONS_CONFIG.USER_ROLE;

  const greeting = role === 'ADMIN_ROLE' ? 'Panel de Administración' : 'Mi Espacio';
  const subtitle = user?.name
    ? `Hola, ${user.name.split(' ')[0]}. ${role === 'ADMIN_ROLE' ? 'Aquí está el resumen de hoy.' : 'Bienvenido de vuelta.'}`
    : role === 'ADMIN_ROLE' ? 'Gestiona tu barbería desde aquí.' : 'Bienvenido a Five Friends.';

  const statCards = role === 'ADMIN_ROLE'
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

      <p style={s.sectionLabel}>Resumen</p>
      <div style={s.statsGrid}>
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      <p style={s.sectionLabel}>Acciones rápidas</p>
      <div style={s.actionsGrid}>
        {actions.map((action) => (
          <ActionCard key={action.to} {...action} />
        ))}
      </div>
    </div>
  );
}
