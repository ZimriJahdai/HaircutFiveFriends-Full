import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

const NAV_CONFIG = {
  ADMIN_ROLE: [
    { label: 'Inicio',             icon: 'ti-home',       to: '/dashboard' },
    { label: 'Cortes de cabello',  icon: 'ti-scissors',   to: '/dashboard/haircut' },
    { label: 'Productos',          icon: 'ti-package',    to: '/dashboard/productos' },
    { label: 'Citas',              icon: 'ti-calendar',   to: '/dashboard/citas' },
    { label: 'Clientes',           icon: 'ti-users',      to: '/dashboard/clientes' },
    { label: 'Barberos',           icon: 'ti-id-badge',   to: '/dashboard/barberos' },
    { label: 'Reportes',           icon: 'ti-chart-bar',  to: '/dashboard/reportes' },
    { type: 'section', label: 'Servicios' },
    { label: 'Servicios',          icon: 'ti-scissors',   to: '/dashboard/servicios' },
    { label: 'Reseñas',            icon: 'ti-star',       to: '/dashboard/resenas' },
    { type: 'section', label: 'Cuenta' },
  ],
  EMPLOYEE_ROLE: [
    { label: 'Inicio',             icon: 'ti-home',       to: '/dashboard' },
    { label: 'Cortes de cabello',  icon: 'ti-scissors',   to: '/dashboard/haircut' },
    { label: 'Productos',          icon: 'ti-package',    to: '/dashboard/productos' },
    { label: 'Citas',              icon: 'ti-calendar',   to: '/dashboard/citas' },
    { label: 'Clientes',           icon: 'ti-users',      to: '/dashboard/clientes' },
    { type: 'section', label: 'Servicios' },
    { label: 'Servicios',          icon: 'ti-scissors',   to: '/dashboard/servicios' },
    { label: 'Reseñas',            icon: 'ti-star',       to: '/dashboard/resenas' },
    { type: 'section', label: 'Cuenta' },
  ],
  USER_ROLE: [
    { label: 'Inicio',             icon: 'ti-home',           to: '/client' },
    { label: 'Reservar cita',      icon: 'ti-calendar-plus',  to: '/client/reservar', badge: 'Nuevo' },
    { label: 'Productos',          icon: 'ti-package',        to: '/client/productos' },
    { label: 'Mis citas',          icon: 'ti-calendar',       to: '/client/citas' },
    { type: 'section', label: 'Cuenta' },
    { label: 'Mi perfil',          icon: 'ti-user-circle',    to: '/client/perfil' },
    { label: 'Servicios',          icon: 'ti-scissors',       to: '/client/servicios' },
    { label: 'Reseñas',            icon: 'ti-star',           to: '/client/resenas' },
    { label: 'Notificaciones',     icon: 'ti-bell',           to: '/client/notificaciones' },
  ],
};

const s = {
  sidebar: (collapsed) => ({
    width: collapsed ? '60px' : '220px',
    background: '#111',
    borderRight: '1px solid #1E1E1E',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexShrink: 0,
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  }),
  brand: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '18px 14px', borderBottom: '1px solid #1E1E1E',
    whiteSpace: 'nowrap', overflow: 'hidden',
  },
  logo: {
    width: '32px', height: '32px', background: '#C9A84C', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', color: '#0A0A0A', flexShrink: 0,
  },
  brandName: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px',
    letterSpacing: '2px', color: '#E8E4DC', lineHeight: 1,
  },
  brandSub: { fontSize: '10px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' },
  sectionLabel: (collapsed) => ({
    padding: '10px 14px 4px', fontSize: '9px', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#333', whiteSpace: 'nowrap',
    opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s',
  }),
  nav: { flex: 1, padding: '6px 8px', overflow: 'hidden' },
  item: (active, hovered) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 10px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '13px', whiteSpace: 'nowrap', marginBottom: '2px',
    overflow: 'hidden', textDecoration: 'none',
    background: active ? '#C9A84C18' : hovered ? '#1A1A1A' : 'transparent',
    color: active ? '#FFFFFF' : hovered ? '#E8E4DC' : '#666',
    transition: 'background 0.15s, color 0.15s',
  }),
  itemIcon: { fontSize: '18px', flexShrink: 0 },
  itemLabel: (collapsed) => ({ display: collapsed ? 'none' : 'block' }),
  badge: (collapsed) => ({
    display: collapsed ? 'none' : 'block', marginLeft: 'auto',
    background: '#C9A84C', color: '#0A0A0A', fontSize: '10px',
    fontWeight: 500, padding: '1px 6px', borderRadius: '10px', flexShrink: 0,
  }),
  foot: { borderTop: '1px solid #1E1E1E', padding: '10px 8px' },
  logoutBtn: (hovered) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 10px', borderRadius: '6px', cursor: 'pointer',
    border: 'none', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden',
    background: hovered ? '#2A1515' : 'transparent',
    color: hovered ? '#E87878' : '#555',
    transition: 'background 0.15s, color 0.15s', fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
  }),
};

function NavItem({ item, collapsed }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={item.to}
      end={item.to.split('/').length <= 2}
      style={({ isActive }) => s.item(isActive, hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <i className={`ti ${item.icon}`} style={s.itemIcon} aria-hidden="true" />
      <span style={s.itemLabel(collapsed)}>{item.label}</span>
      {item.badge && <span style={s.badge(collapsed)}>{item.badge}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed }) {
  const user    = useAuthStore((state) => state.user);
  const logout  = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [logoutHovered, setLogoutHovered] = useState(false);

  const role     = user?.role || 'USER_ROLE';
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.USER_ROLE;

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <aside style={s.sidebar(collapsed)}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      {/* Brand */}
      <div style={s.brand}>
        <div style={s.logo}>
          <i className="ti ti-scissors" aria-hidden="true" />
        </div>
        <div>
          <div style={s.brandName}>Five Friends</div>
          <div style={s.brandSub}>Barbería</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={s.nav}>
        {navItems.map((item, i) =>
          item.type === 'section' ? (
            <div key={i} style={s.sectionLabel(collapsed)}>{item.label}</div>
          ) : (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          )
        )}
      </nav>

      {/* Footer: solo botón de cerrar sesión */}
      <div style={s.foot}>
        <button
          style={s.logoutBtn(logoutHovered)}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <i className="ti ti-logout" style={{ fontSize: '18px', flexShrink: 0 }} aria-hidden="true" />
          <span style={s.itemLabel(collapsed)}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
