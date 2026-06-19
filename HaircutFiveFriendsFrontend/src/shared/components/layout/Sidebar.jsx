import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

const NAV_CONFIG = {
  ADMIN_ROLE: [
    { label: 'Inicio', icon: 'ti-home', to: '/dashboard' },
    { label: 'Cortes de cabello', icon: 'ti-scissors', to: '/dashboard/haircut' },
    { label: 'Productos', icon: 'ti-package', to: '/dashboard/productos' },
    { label: 'Citas', icon: 'ti-calendar', to: '/dashboard/citas' },
    { label: 'Clientes', icon: 'ti-users', to: '/dashboard/clientes' },
    { label: 'Barberos', icon: 'ti-id-badge', to: '/dashboard/barberos' },
    { label: 'Reportes', icon: 'ti-chart-bar', to: '/dashboard/reportes' },
    { type: 'section', label: 'Servicios' },
    { label: 'Servicios', icon: 'ti-scissors', to: '/dashboard/servicios' },
    { label: 'Reseñas', icon: 'ti-star', to: '/dashboard/resenas' },
    { type: 'section', label: 'Cuenta' },
  ],
  USER_ROLE: [
    { label: 'Inicio', icon: 'ti-home', to: '/client' },
    { label: 'Reservar cita', icon: 'ti-calendar-plus', to: '/client/reservar', badge: 'Nuevo' },
    { label: 'Productos', icon: 'ti-package', to: '/client/productos' },
    { label: 'Mis citas', icon: 'ti-calendar', to: '/client/citas' },
    { type: 'section', label: 'Cuenta' },
    { label: 'Mi perfil', icon: 'ti-user-circle', to: '/client/perfil' },
    { label: 'Servicios', icon: 'ti-scissors', to: '/client/servicios' },
    { label: 'Reseñas', icon: 'ti-star', to: '/client/resenas' },
    { label: 'Notificaciones', icon: 'ti-bell', to: '/client/notificaciones' },
  ],
};

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.to.split('/').length <= 2}
      className={({ isActive }) =>
        `flex items-center gap-[10px] px-[10px] py-[9px] rounded-[6px] cursor-pointer text-[13px] whitespace-nowrap mb-[2px] overflow-hidden no-underline transition-colors duration-150 ${
          isActive
            ? 'bg-[#C9A84C18] text-white'
            : 'bg-transparent text-[#666] hover:bg-[#1A1A1A] hover:text-[#E8E4DC]'
        }`
      }
    >
      <i className={`ti ${item.icon} text-lg shrink-0`} aria-hidden="true" />
      <span className={collapsed ? 'hidden' : 'block'}>{item.label}</span>
      {item.badge && (
        <span className={`ml-auto bg-[#C9A84C] text-[#0A0A0A] text-[10px] font-medium px-[6px] py-[1px] rounded-[10px] shrink-0 ${collapsed ? 'hidden' : 'block'}`}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const role = user?.role || 'USER_ROLE';
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.USER_ROLE;

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <aside
      className={`bg-[#111] border-r border-[#1E1E1E] flex flex-col h-screen shrink-0 overflow-hidden transition-[width] duration-[250ms] font-sans ${
        collapsed ? 'w-[60px]' : 'w-[220px]'
      }`}
    >
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      {/* Brand */}
      <div className="flex items-center gap-[10px] px-[14px] py-[18px] border-b border-[#1E1E1E] whitespace-nowrap overflow-hidden">
        <div className="w-8 h-8 bg-[#C9A84C] rounded-[6px] flex items-center justify-center text-base text-[#0A0A0A] shrink-0">
          <i className="ti ti-scissors" aria-hidden="true" />
        </div>
        <div>
          <div className="font-['Bebas_Neue',sans-serif] text-lg tracking-[2px] text-[#E8E4DC] leading-none">Five Friends</div>
          <div className="text-[10px] text-[#444] tracking-[1px] uppercase">Barbería</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-[6px] overflow-hidden">
        {navItems.map((item, i) =>
          item.type === 'section' ? (
            <div
              key={i}
              className={`px-[14px] pt-[10px] pb-1 text-[9px] tracking-[2px] uppercase text-[#333] whitespace-nowrap transition-opacity duration-200 ${
                collapsed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {item.label}
            </div>
          ) : (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          )
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1E1E1E] px-2 py-[10px]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-[6px] cursor-pointer border-none w-full whitespace-nowrap overflow-hidden text-[13px] font-sans transition-colors duration-150 bg-transparent text-[#555] hover:bg-[#2A1515] hover:text-[#E87878]"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <i className="ti ti-logout text-lg shrink-0" aria-hidden="true" />
          <span className={collapsed ? 'hidden' : 'block'}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
