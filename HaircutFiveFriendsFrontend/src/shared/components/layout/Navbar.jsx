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

function DropItem({ icon, label, onClick, danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className={`flex items-center gap-[9px] px-2.5 py-2 rounded-md cursor-pointer border-none w-full text-[13px] font-sans transition-colors ${
        danger
          ? (hovered ? 'bg-[#2A1515] text-[#E88]' : 'bg-transparent text-[#885]')
          : (hovered ? 'bg-[#1A1A1A] text-[#E8E4DC]' : 'bg-transparent text-[#888]')
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <i className={`ti ${icon} text-base shrink-0`} />
      {label}
    </button>
  );
}

export default function Navbar({ onToggleSidebar, hasNotifications = true }) {
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

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
    role === 'ADMIN_RESTAURANTE' || role === 'ADMIN_RESTAURANT' ? 'Admin Rest.' :
    'Cliente';

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
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
    <header className="h-[54px] bg-[#111] border-b border-[#1E1E1E] flex items-center px-5 gap-3 font-sans shrink-0 relative z-50">
      <button
        onClick={onToggleSidebar}
        className="w-8 h-8 rounded-md hover:bg-[#1A1A1A] flex items-center justify-center cursor-pointer border-none text-[#555] hover:text-[#AAA] text-lg shrink-0 transition-colors"
        aria-label="Colapsar sidebar"
      >
        <i className="ti ti-menu-2" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-1.5 text-[13px] text-[#444] flex-1">
        <span>{section}</span>
        <span className="text-[10px]">›</span>
        <span className="text-[#E8E4DC] font-medium">{currentPage}</span>
      </div>

      <div className="flex items-center gap-2 bg-[#1A1A1A] focus-within:bg-[#1E1E1E] border border-[#1E1E1E] focus-within:border-[#C9A84C]/30 rounded-md px-3 h-8 cursor-text transition-colors">
        <i className="ti ti-search text-sm text-[#333]" aria-hidden="true" />
        <input
          type="text" placeholder="Buscar..."
          className="bg-transparent border-none outline-none text-[12px] text-[#AAA] font-sans w-[140px] placeholder-[#555]"
          aria-label="Buscar"
        />
      </div>

      <div className="flex items-center gap-1">
        <div className="w-8 h-8 rounded-md hover:bg-[#1A1A1A] flex items-center justify-center cursor-pointer text-lg border-none text-[#555] hover:text-[#AAA] transition-colors relative" role="button" aria-label="Notificaciones">
          <i className="ti ti-bell" aria-hidden="true" />
          {hasNotifications && <span className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-[#C9A84C] rounded-full border border-[#111]" />}
        </div>

        <div className="w-px h-5 bg-[#1E1E1E] mx-1" />

        <div ref={dropRef} className="relative">
          <div
            className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors ${dropOpen ? 'bg-[#1A1A1A]' : 'hover:bg-[#1A1A1A]'}`}
            onClick={() => setDropOpen((v) => !v)}
            role="button"
            aria-label="Menú de usuario"
            aria-expanded={dropOpen}
          >
            <div className="w-7 h-7 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[10px] font-medium text-[#C9A84C] shrink-0 overflow-hidden">
              {(user?.profilePicture || user?.ProfilePicture) ? (
                <img
                  src={user.profilePicture || user.ProfilePicture} alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.innerText = initials;
                  }}
                />
              ) : initials}
            </div>
            <div>
              <div className="text-[12px] text-[#E8E4DC] font-semibold">{shortName}</div>
              <div className="text-[10px] text-[#555]">{roleShort}</div>
            </div>
            <i
              className="ti ti-chevron-down text-[12px] text-[#555] transition-transform"
              style={{ transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            />
          </div>

          {dropOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 bg-[#161616] border border-[#1E1E1E] rounded-lg p-1.5 min-w-[180px] z-[100] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              <div className="px-2.5 pb-2.5 border-b border-[#1E1E1E] mb-1">
                <div className="text-[13px] text-white font-bold mb-0.5">{user?.name || 'Usuario'}</div>
                <div className="text-[11px] text-[#555]">{user?.email || ''}</div>
              </div>
              <DropItem icon="ti-user-circle" label="Mi perfil" onClick={goToProfile} />
              <div className="h-px bg-[#1E1E1E] my-1" />
              <DropItem icon="ti-logout" label="Cerrar sesión" onClick={handleLogout} danger />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
