import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

const ROUTE_LABELS = {
  '/dashboard': 'Inicio',
  '/dashboard/haircut': 'Cortes de cabello',
  '/dashboard/citas': 'Citas',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/barberos': 'Barberos',
  '/dashboard/reportes': 'Reportes',
  '/dashboard/productos': 'Productos',
  '/dashboard/servicios': 'Servicios',
  '/dashboard/resenas': 'Reseñas',
  '/dashboard/configuracion': 'Configuración',
  '/dashboard/perfil': 'Mi perfil',
  '/client': 'Inicio',
  '/client/reservar': 'Reservar cita',
  '/client/citas': 'Mis citas',
  '/client/perfil': 'Mi perfil',
  '/client/servicios': 'Servicios',
  '/client/notificaciones': 'Notificaciones',
  '/client/productos': 'Productos',
  '/client/resenas': 'Reseñas',
};

const s = {
  navbar: {
    height: '54px', background: '#111', borderBottom: '1px solid #1E1E1E',
    display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px',
    fontFamily: "'Inter', sans-serif", flexShrink: 0, position: 'relative', zIndex: 50,
  },
  toggleBtn: (hovered) => ({
    width: '32px', height: '32px', borderRadius: '6px',
    background: hovered ? '#1A1A1A' : 'transparent', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: hovered ? '#AAA' : '#555', fontSize: '18px', flexShrink: 0,
    transition: 'background 0.15s, color 0.15s',
  }),
  breadcrumb: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#444', flex: 1,
  },
  breadcrumbActive: { color: '#E8E4DC', fontWeight: 500 },
  search: (focused) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    background: focused ? '#1E1E1E' : '#1A1A1A',
    border: `1px solid ${focused ? '#C9A84C44' : '#1E1E1E'}`,
    borderRadius: '6px', padding: '0 12px', height: '32px',
    cursor: 'text', transition: 'border-color 0.15s',
  }),
  searchInput: {
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: '12px', color: '#AAA', fontFamily: "'Inter', sans-serif", width: '140px',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '4px' },
  iconBtn: (hovered) => ({
    width: '32px', height: '32px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '18px', border: 'none',
    background: hovered ? '#1A1A1A' : 'transparent',
    color: hovered ? '#AAA' : '#555',
    transition: 'background 0.15s, color 0.15s', position: 'relative',
  }),
  notifDot: {
    position: 'absolute', top: '6px', right: '6px',
    width: '6px', height: '6px', background: '#C9A84C',
    borderRadius: '50%', border: '1px solid #111',
  },
  divider: { width: '1px', height: '20px', background: '#1E1E1E', margin: '0 4px' },
  profile: (hovered, open) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '4px 8px', borderRadius: '6px', cursor: 'pointer',
    background: hovered || open ? '#1A1A1A' : 'transparent',
    transition: 'background 0.15s', position: 'relative',
  }),
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: '#C9A84C22', border: '1px solid #C9A84C44',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: 500, color: '#C9A84C', flexShrink: 0,
    overflow: 'hidden',
  },
  pname: { fontSize: '12px', color: '#E8E4DC', fontWeight: 600 },
  prole: { fontSize: '10px', color: '#555' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#161616', border: '1px solid #1E1E1E', borderRadius: '8px',
    padding: '6px', minWidth: '180px', zIndex: 100,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  dropHeader: {
    padding: '8px 10px 10px', borderBottom: '1px solid #1E1E1E', marginBottom: '4px',
  },
  dropName: { fontSize: '13px', color: '#FFFFFF', fontWeight: 700, marginBottom: '2px' },
  dropEmail: { fontSize: '11px', color: '#555' },
  dropItem: (hovered, danger) => ({
    display: 'flex', alignItems: 'center', gap: '9px',
    padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', border: 'none',
    width: '100%', fontSize: '13px', fontFamily: "'Inter', sans-serif",
    background: hovered ? (danger ? '#2A1515' : '#1A1A1A') : 'transparent',
    color: hovered ? (danger ? '#E87878' : '#E8E4DC') : (danger ? '#885555' : '#888'),
    transition: 'background 0.12s, color 0.12s',
  }),
};

function DropItem({ icon, label, onClick, danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={s.dropItem(hovered, danger)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <i className={`ti ${icon}`} style={{ fontSize: '16px', flexShrink: 0 }} />
      {label}
    </button>
  );
}

export default function Navbar({ onToggleSidebar, hasNotifications = true }) {
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const [toggleHovered, setToggleHovered] = useState(false);
  const [bellHovered,   setBellHovered]   = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);
  const [searchFocused, setSearchFocused]   = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

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
    role === 'ADMIN_ROLE' ? 'Administrador' :
    role === 'EMPLOYEE_ROLE' ? 'Barbero' :
    'Cliente';

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate('/auth', { replace: true });
  };

  const goToProfile = () => {
    setDropOpen(false);
    navigate(role === 'ADMIN_ROLE' || role === 'EMPLOYEE_ROLE' ? '/dashboard/perfil' : '/client/perfil');
  };

  return (
    <header style={s.navbar}>
      {/* Toggle sidebar */}
      <button
        style={s.toggleBtn(toggleHovered)}
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
        onClick={onToggleSidebar}
        aria-label="Colapsar sidebar"
      >
        <i className="ti ti-menu-2" aria-hidden="true" />
      </button>

      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <span>{section}</span>
        <span style={{ fontSize: '10px' }}>›</span>
        <span style={s.breadcrumbActive}>{currentPage}</span>
      </div>

      {/* Buscador */}
      <div style={s.search(searchFocused)}>
        <i className="ti ti-search" style={{ fontSize: '14px', color: '#333' }} aria-hidden="true" />
        <input
          type="text" placeholder="Buscar..." style={s.searchInput}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Buscar"
        />
      </div>

      <div style={s.actions}>
        {/* Notificaciones */}
        <div
          style={s.iconBtn(bellHovered)}
          onMouseEnter={() => setBellHovered(true)}
          onMouseLeave={() => setBellHovered(false)}
          role="button" aria-label="Notificaciones"
        >
          <i className="ti ti-bell" aria-hidden="true" />
          {hasNotifications && <span style={s.notifDot} />}
        </div>

        <div style={s.divider} />

        {/* Perfil con dropdown */}
        <div
          ref={dropRef}
          style={{ position: 'relative' }}
        >
          <div
            style={s.profile(profileHovered, dropOpen)}
            onMouseEnter={() => setProfileHovered(true)}
            onMouseLeave={() => setProfileHovered(false)}
            onClick={() => setDropOpen((v) => !v)}
            role="button"
            aria-label="Menú de usuario"
            aria-expanded={dropOpen}
          >
            <div style={s.avatar}>
              {user?.profilePicture || user?.ProfilePicture ? (
                <img
                  src={user.profilePicture || user.ProfilePicture} alt="Foto de perfil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.innerText = initials;
                  }}
                />
              ) : initials}
            </div>
            <div>
              <div style={s.pname}>{shortName}</div>
              <div style={s.prole}>{roleShort}</div>
            </div>
            <i
              className="ti ti-chevron-down"
              style={{ fontSize: '12px', color: '#555', transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            />
          </div>

          {/* Dropdown */}
          {dropOpen && (
            <div style={s.dropdown}>
              <div style={s.dropHeader}>
                <div style={s.dropName}>{user?.name || 'Usuario'}</div>
                <div style={s.dropEmail}>{user?.email || ''}</div>
              </div>
              <DropItem icon="ti-user-circle" label="Mi perfil"      onClick={goToProfile} />
              <div style={{ height: '1px', background: '#1E1E1E', margin: '4px 0' }} />
              <DropItem icon="ti-logout"      label="Cerrar sesión"  onClick={handleLogout} danger />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
