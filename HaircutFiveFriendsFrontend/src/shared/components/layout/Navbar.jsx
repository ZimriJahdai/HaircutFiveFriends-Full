import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

const PAGES = [
  { label: 'Inicio',                icon: 'ti-home',           path: '/dashboard' },
  { label: 'Cortes de cabello',     icon: 'ti-scissors',       path: '/dashboard/haircut' },
  { label: 'Citas',                 icon: 'ti-calendar',       path: '/dashboard/citas' },
  { label: 'Clientes',              icon: 'ti-users',          path: '/dashboard/clientes' },
  { label: 'Barberos',              icon: 'ti-id-badge',       path: '/dashboard/barberos' },
  { label: 'Reportes',              icon: 'ti-chart-bar',      path: '/dashboard/reportes' },
  { label: 'Productos',             icon: 'ti-package',        path: '/dashboard/productos' },
  { label: 'Servicios',             icon: 'ti-scissors',       path: '/dashboard/servicios' },
  { label: 'Reseñas',               icon: 'ti-star',           path: '/dashboard/resenas' },
  { label: 'Mi perfil',             icon: 'ti-user-circle',    path: '/dashboard/perfil' },
  { label: 'Reservar cita',         icon: 'ti-calendar-plus',  path: '/client/reservar' },
  { label: 'Mis citas',             icon: 'ti-calendar',       path: '/client/citas' },
  { label: 'Notificaciones',        icon: 'ti-bell',           path: '/client/notificaciones' },
  { label: 'Productos (cliente)',   icon: 'ti-package',        path: '/client/productos' },
  { label: 'Servicios (cliente)',   icon: 'ti-scissors',       path: '/client/servicios' },
  { label: 'Reseñas (cliente)',     icon: 'ti-star',           path: '/client/resenas' },
];

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

export default function Navbar({ onToggleSidebar }) {
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const [dropOpen, setDropOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const dropRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role || 'USER_ROLE';
  const section = role === 'ADMIN_ROLE' ? 'Dashboard' : 'Mi espacio';
  const currentPage = PAGES.find(p => p.path === location.pathname)?.label || 'Inicio';

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

  const isAdmin = role === 'ADMIN_ROLE' || role === 'EMPLOYEE_ROLE';

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const filtered = PAGES.filter(p =>
      p.label.toLowerCase().includes(q) ||
      p.path.toLowerCase().includes(q)
    );
    const prefix = isAdmin ? '/dashboard' : '/client';
    return filtered.filter(p => p.path.startsWith(prefix)).slice(0, 6);
  }, [query, isAdmin]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
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
    navigate(isAdmin ? '/dashboard/perfil' : '/client/perfil');
  };

  const goTo = (path) => {
    setQuery('');
    setShowResults(false);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      goTo(results[0].path);
    }
    if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
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

      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2 bg-[#1A1A1A] focus-within:bg-[#1E1E1E] border border-[#1E1E1E] focus-within:border-[#C9A84C]/30 rounded-md px-3 h-8 cursor-text transition-colors">
          <i className="ti ti-search text-sm text-[#333]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text" placeholder="Buscar..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => query.trim() && setShowResults(true)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-[12px] text-[#AAA] font-sans w-[140px] placeholder-[#555]"
            aria-label="Buscar"
          />
        </div>
        {showResults && query.trim() && (
          <div className="absolute top-[calc(100%+6px)] right-0 bg-[#161616] border border-[#1E1E1E] rounded-lg p-1.5 min-w-[200px] z-[100] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            {results.length === 0 ? (
              <div className="px-2.5 py-2 text-[12px] text-[#555]">Sin resultados</div>
            ) : results.map((p) => (
              <button
                key={p.path}
                onClick={() => goTo(p.path)}
                className="flex items-center gap-[9px] px-2.5 py-2 rounded-md cursor-pointer border-none w-full text-[13px] font-sans bg-transparent text-[#888] hover:bg-[#1A1A1A] hover:text-[#E8E4DC] transition-colors"
              >
                <i className={`ti ${p.icon} text-base shrink-0`} />
                {p.label}
              </button>
            ))}
          </div>
        )}
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
    </header>
  );
}
