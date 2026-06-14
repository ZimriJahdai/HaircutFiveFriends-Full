import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

const NAV_CONFIG = {
  ADMIN_ROLE: [
    { label: 'Inicio', icon: 'ti-home', to: '/dashboard' },
    { label: 'Cortes de cabello', icon: 'ti-scissors', to: '/dashboard/haircut' },
    { label: 'Citas', icon: 'ti-calendar', to: '/dashboard/citas', badge: null },
    { label: 'Clientes', icon: 'ti-users', to: '/dashboard/clientes' },
    { label: 'Barberos', icon: 'ti-id-badge', to: '/dashboard/barberos' },
    { label: 'Reportes', icon: 'ti-chart-bar', to: '/dashboard/reportes' },
    { type: 'section', label: 'Servicios' },
    { label: 'Catálogo', icon: 'ti-list', to: '/dashboard/catalogo' },
    { type: 'section', label: 'Sistema' },
    { label: 'Configuración', icon: 'ti-settings', to: '/dashboard/configuracion' },
  ],
  USER_ROLE: [
    { label: 'Inicio', icon: 'ti-home', to: '/client' },
    { label: 'Reservar cita', icon: 'ti-calendar-plus', to: '/client/reservar', badge: 'Nuevo' },
    { label: 'Mis citas', icon: 'ti-calendar', to: '/client/citas' },
    { type: 'section', label: 'Cuenta' },
    { label: 'Mi perfil', icon: 'ti-user-circle', to: '/client/perfil' },
    { label: 'Servicios', icon: 'ti-scissors', to: '/client/servicios' },
    { label: 'Notificaciones', icon: 'ti-bell', to: '/client/notificaciones' },

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
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '18px 14px',
    borderBottom: '1px solid #1E1E1E',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  logo: {
    width: '32px', height: '32px',
    background: '#C9A84C', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', color: '#0A0A0A', flexShrink: 0,
  },
  brandName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '18px', letterSpacing: '2px',
    color: '#E8E4DC', lineHeight: 1,
  },
  brandSub: {
    fontSize: '10px', color: '#444',
    letterSpacing: '1px', textTransform: 'uppercase',
  },
  sectionLabel: (collapsed) => ({
    padding: '10px 14px 4px',
    fontSize: '9px', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#333',
    whiteSpace: 'nowrap',
    opacity: collapsed ? 0 : 1,
    transition: 'opacity 0.2s',
  }),
  nav: {
    flex: 1, padding: '6px 8px', overflow: 'hidden',
  },
  item: (active, hovered) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 10px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '13px',
    whiteSpace: 'nowrap', marginBottom: '2px',
    overflow: 'hidden', textDecoration: 'none',
    background: active ? '#C9A84C18' : hovered ? '#1A1A1A' : 'transparent',
    color: active ? '#C9A84C' : hovered ? '#AAA' : '#555',
    transition: 'background 0.15s, color 0.15s',
  }),
  itemIcon: { fontSize: '18px', flexShrink: 0 },
  itemLabel: (collapsed) => ({ display: collapsed ? 'none' : 'block' }),
  badge: (collapsed) => ({
    display: collapsed ? 'none' : 'block',
    marginLeft: 'auto',
    background: '#C9A84C', color: '#0A0A0A',
    fontSize: '10px', fontWeight: 500,
    padding: '1px 6px', borderRadius: '10px', flexShrink: 0,
  }),
  foot: {
    borderTop: '1px solid #1E1E1E', padding: '12px 8px',
  },
  userRow: (hovered) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 10px', borderRadius: '6px',
    cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap',
    background: hovered ? '#1A1A1A' : 'transparent',
    transition: 'background 0.15s',
  }),
  avatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    background: '#C9A84C22', border: '1px solid #C9A84C44',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 500, color: '#C9A84C', flexShrink: 0,
  },
  uname: { fontSize: '12px', color: '#AAA', fontWeight: 500 },
  urole: { fontSize: '10px', color: '#444' },
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

export default function Sidebar({ collapsed, onToggle }) {
  const user = useAuthStore((state) => state.user);
  const [userHovered, setUserHovered] = useState(false);
  const navigate = useNavigate();

  const role = user?.role || 'USER_ROLE';
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.USER_ROLE;

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleLabel =
    role === 'ADMIN_ROLE' ? 'Administrador' :
      role === 'ADMIN_RESTAURANTE' || role === 'ADMIN_RESTAURANT' ? 'Admin Restaurante' :
        'Cliente';

  return (
    <aside style={s.sidebar(collapsed)}>
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />

      <div style={s.brand}>
        <div style={s.logo}>
          <i className="ti ti-scissors" aria-hidden="true" />
        </div>
        <div>
          <div style={s.brandName}>Five Friends</div>
          <div style={s.brandSub}>Barbería</div>
        </div>
      </div>

      <nav style={s.nav}>
        {navItems.map((item, i) =>
          item.type === 'section' ? (
            <div key={i} style={s.sectionLabel(collapsed)}>{item.label}</div>
          ) : (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          )
        )}
      </nav>

      <div style={s.foot}>
        <div
          style={s.userRow(userHovered)}
          onMouseEnter={() => setUserHovered(true)}
          onMouseLeave={() => setUserHovered(false)}
          onClick={() => navigate(role === 'ADMIN_ROLE' ? '/dashboard/configuracion' : '/client/perfil')}
        >
          <div style={s.avatar}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Foto de perfil"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : initials}
          </div>
          <div>
            <div style={s.uname}>{user?.name || 'Usuario'}</div>
            <div style={s.urole}>{roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
