import { Link, NavLink } from 'react-router-dom';
import { AvatarUser } from '../../../shared/components/ui/AvatarUser.jsx';
import { useFavoritesStore } from '../../favorites/store/useFavoritesStore.js';

const CLIENT_MENU_ITEMS = [
  { label: 'Mi Perfil', to: '/client/perfil', icon: 'ti-user-circle' },
];

export default function NavbarClient() {
  const favCount = useFavoritesStore((s) => s.favoriteIds.length);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${isActive
      ? 'bg-[#00D2C4]/10 text-[#00D2C4]'
      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#070707]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 h-22 flex items-center gap-4">

        {/* Logo */}
        <Link
          to="/client"
          className="flex items-center gap-3 group flex-shrink-0"
        >
          <div>
            <h1 className="font-['Bebas_Neue'] text-3xl leading-none tracking-wider text-white">
              HAIRCUT
            </h1>
            <p className="text-[10px] tracking-[4px] text-zinc-500">
              FIVE FRIENDS
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex flex-1 min-w-0 items-center overflow-x-auto bg-white/[0.03] border border-white/5 rounded-2xl px-3 py-2 scrollbar-thin scrollbar-thumb-[#00D2C4]/30 scrollbar-track-transparent">

          <NavLink to="/client" end className={navLinkClass}>
            <i className="ti ti-home text-base" />
            Inicio
          </NavLink>

          <NavLink to="/client/servicios" className={navLinkClass}>
            <i className="ti ti-cut text-base" />
            Servicios
          </NavLink>

          <NavLink to="/client/barberos" className={navLinkClass}>
            <i className="ti ti-user text-base" />
            Barberos
          </NavLink>

          <NavLink to="/client/productos" className={navLinkClass}>
            <i className="ti ti-package text-base" />
            Productos
          </NavLink>

          <NavLink to="/client/facturas" className={navLinkClass}>
            <i className="ti ti-file-text text-base" />
            Facturas
          </NavLink>

          <NavLink to="/client/probar-corte" className={navLinkClass}>
            <i className="ti ti-camera text-base" />
            Probar corte
          </NavLink>

          <NavLink to="/client/galeria" className={navLinkClass}>
            <i className="ti ti-photo text-base" />
            Estilos
          </NavLink>

          <NavLink to="/client/compras" className={navLinkClass}>
            <i className="ti ti-shopping-cart text-base" />
            Mis compras
          </NavLink>

          <NavLink to="/client/favoritos" className={navLinkClass}>
            <i className="ti ti-heart text-base" />
            Favoritos
            {favCount > 0 && (
              <span className="ml-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-[#00D2C4] text-[#0A0A0A] text-[10px] font-black px-1">
                {favCount > 99 ? '99+' : favCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/client/resenas" className={navLinkClass}>
            <i className="ti ti-star text-base" />
            Reseñas
          </NavLink>

          <NavLink to="/client/reservar" className={navLinkClass}>
            <i className="ti ti-calendar-event text-base" />
            Reservar
          </NavLink>

        </nav>

        {/* Profile Avatar */}
        <div className="flex-shrink-0">
          <AvatarUser dark menuItems={CLIENT_MENU_ITEMS} />
        </div>

      </div>
    </header>
  );
}
