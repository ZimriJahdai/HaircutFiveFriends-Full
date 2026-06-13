import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

const ROUTE_LABELS = {
  '/dashboard': 'Inicio',
  '/dashboard/citas': 'Citas',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/barberos': 'Barberos',
  '/dashboard/reportes': 'Reportes',
  '/dashboard/catalogo': 'Catálogo',
  '/dashboard/configuracion': 'Configuración',
  '/client': 'Inicio',
  '/client/reservar': 'Reservar cita',
  '/client/citas': 'Mis citas',
  '/client/perfil': 'Mi perfil',
  '/client/servicios': 'Servicios',
  '/client/notificaciones': 'Notificaciones',
};

const s = {
  navbar: {
    height: '54px',
    background: '#111',
    borderBottom: '1px solid #1E1E1E',
    display: 'flex', alignItems: 'center',
    padding: '0 20px', gap: '12px',
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
  },
  toggleBtn: (hovered) => ({
    width: '32px', height: '32px', borderRadius: '6px',
    background: hovered ? '#1A1A1A' : 'transparent',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: hovered ? '#AAA' : '#555',
    fontSize: '18px', flexShrink: 0,
    transition: 'background 0.15s, color 0.15s',
  }),
  breadcrumb: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#444', flex: 1,
  },
  breadcrumbActive: {
    color: '#E8E4DC', fontWeight: 500,
  },
  search: (focused) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    background: focused ? '#1E1E1E' : '#1A1A1A',
    border: `1px solid ${focused ? '#C9A84C44' : '#1E1E1E'}`,
    borderRadius: '6px', padding: '0 12px', height: '32px',
    cursor: 'text', transition: 'border-color 0.15s',
  }),
  searchIcon: { fontSize: '14px', color: '#333' },
  searchInput: {
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: '12px', color: '#AAA', fontFamily: "'Inter', sans-serif",
    width: '140px',
  },
  actions: {
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  iconBtn: (hovered) => ({
    width: '32px', height: '32px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '18px',
    background: hovered ? '#1A1A1A' : 'transparent',
    color: hovered ? '#AAA' : '#555',
    transition: 'background 0.15s, color 0.15s',
    position: 'relative',
  }),
  notifDot: {
    position: 'absolute', top: '6px', right: '6px',
    width: '6px', height: '6px',
    background: '#C9A84C', borderRadius: '50%',
    border: '1px solid #111',
  },
  divider: {
    width: '1px', height: '20px',
    background: '#1E1E1E', margin: '0 4px',
  },
  profile: (hovered) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '4px 8px', borderRadius: '6px',
    cursor: 'pointer',
    background: hovered ? '#1A1A1A' : 'transparent',
    transition: 'background 0.15s',
  }),
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: '#C9A84C22', border: '1px solid #C9A84C44',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: 500, color: '#C9A84C', flexShrink: 0,
  },
  pname: { fontSize: '12px', color: '#AAA', fontWeight: 500 },
  prole: { fontSize: '10px', color: '#444' },
};

export default function Navbar({ onToggleSidebar, hasNotifications = true }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const [toggleHovered, setToggleHovered] = useState(false);
  const [bellHovered, setBellHovered] = useState(false);
  const [settingsHovered, setSettingsHovered] = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const role = user?.role || 'USER_ROLE';
  const section = role === 'ADMIN_ROLE' ? 'Dashboard' : 'Mi espacio';
  const currentPage = ROUTE_LABELS[location.pathname] || 'Inicio';

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const shortName = user?.name
    ? user.name.split(' ')[0] + (user.name.split(' ')[1] ? ' ' + user.name.split(' ')[1][0] + '.' : '')
    : 'Usuario';

  const roleShort =
    role === 'ADMIN_ROLE' ? 'Admin' :
    role === 'ADMIN_RESTAURANTE' || role === 'ADMIN_RESTAURANT' ? 'Admin Rest.' :
    'Cliente';

  return (
    <header style={s.navbar}>
      <button
        style={s.toggleBtn(toggleHovered)}
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
        onClick={onToggleSidebar}
        aria-label="Colapsar sidebar"
      >
        <i className="ti ti-menu-2" aria-hidden="true" />
      </button>

      <div style={s.breadcrumb}>
        <span>{section}</span>
        <span style={{ fontSize: '10px' }}>›</span>
        <span style={s.breadcrumbActive}>{currentPage}</span>
      </div>

      <div style={s.search(searchFocused)}>
        <i className="ti ti-search" style={s.searchIcon} aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar..."
          style={s.searchInput}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Buscar"
        />
      </div>

      <div style={s.actions}>
        <div
          style={s.iconBtn(bellHovered)}
          onMouseEnter={() => setBellHovered(true)}
          onMouseLeave={() => setBellHovered(false)}
          title="Notificaciones"
          role="button"
          aria-label="Notificaciones"
        >
          <i className="ti ti-bell" aria-hidden="true" />
          {hasNotifications && <span style={s.notifDot} />}
        </div>

        <div
          style={s.iconBtn(settingsHovered)}
          onMouseEnter={() => setSettingsHovered(true)}
          onMouseLeave={() => setSettingsHovered(false)}
          title="Configuración"
          role="button"
          aria-label="Configuración"
        >
          <i className="ti ti-settings" aria-hidden="true" />
        </div>

        <div style={s.divider} />

        <div
          style={s.profile(profileHovered)}
          onMouseEnter={() => setProfileHovered(true)}
          onMouseLeave={() => setProfileHovered(false)}
          role="button"
          aria-label="Perfil de usuario"
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
            <div style={s.pname}>{shortName}</div>
            <div style={s.prole}>{roleShort}</div>
          </div>
          <i className="ti ti-chevron-down" style={{ fontSize: '12px', color: '#333' }} aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
