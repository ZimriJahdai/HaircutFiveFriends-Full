import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AvatarUser } from '../../../shared/components/ui/AvatarUser.jsx';
import { useFavoritesStore } from '../../favorites/store/useFavoritesStore.js';
import { useCartStore } from '../../cart/store/cartStore.js';
import { CartModal } from '../../cart/components/CartModal.jsx';

const CLIENT_MENU_ITEMS = [
  { label: 'Mi Perfil', to: '/client/perfil', icon: 'ti-user-circle' },
];

export default function NavbarClient() {
  const favCount = useFavoritesStore((state) => state.favoriteIds.length);

  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex shrink-0 items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
      isActive
        ? 'bg-[#00D2C4]/10 text-[#00D2C4]'
        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
    }`;

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070707]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[5.5rem] max-w-[1400px] items-center gap-4 px-6">
          {/* Logo */}
          <Link
            to="/client"
            className="group flex min-w-0 flex-1 items-center gap-3"
          >
            <div>
              <h1 className="font-['Bebas_Neue'] text-4xl leading-none tracking-wider text-white">
                HAIRCUT
              </h1>
              <p className="text-[11px] tracking-[4px] text-zinc-500">
                FIVE FRIENDS
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-colors duration-200 hover:border-[#00D2C4]/30 hover:bg-[#00D2C4]/10 hover:text-white"
              aria-label="Abrir menú"
            >
              <i className="ti ti-menu-2 text-xl" />
            </button>

            <button
              type="button"
              aria-label="Abrir carrito"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition-all duration-200 hover:border-[#00D2C4]/30 hover:bg-[#00D2C4]/5 hover:text-white"
            >
              <i className="ti ti-shopping-cart text-lg" />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#00D2C4] px-1 text-[10px] font-black text-[#0A0A0A] shadow-[0_2px_8px_rgba(0,210,196,0.4)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <AvatarUser dark menuItems={CLIENT_MENU_ITEMS} />
          </div>
        </div>

        <div className={`${menuOpen ? 'block' : 'hidden'} border-t border-white/10 bg-[#070707]/95`}>
          <div className="mx-auto max-w-[1400px] px-6 py-4">
            <nav className="flex flex-col gap-3">
              <NavLink onClick={handleNavClick} to="/client" end className={navLinkClass}>
                <i className="ti ti-home text-base" />
                Inicio
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/servicios" className={navLinkClass}>
                <i className="ti ti-cut text-base" />
                Servicios
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/barberos" className={navLinkClass}>
                <i className="ti ti-user text-base" />
                Barberos
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/productos" className={navLinkClass}>
                <i className="ti ti-package text-base" />
                Productos
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/facturas" className={navLinkClass}>
                <i className="ti ti-file-text text-base" />
                Facturas
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/compras" className={navLinkClass}>
                <i className="ti ti-shopping-cart text-base" />
                Mis compras
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/reportes" className={navLinkClass}>
                <i className="ti ti-chart-bar text-base" />
                Reportes
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/probar-corte" className={navLinkClass}>
                <i className="ti ti-camera text-base" />
                Probar corte
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/galeria" className={navLinkClass}>
                <i className="ti ti-photo text-base" />
                Estilos
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/favoritos" className={navLinkClass}>
                <i className="ti ti-heart text-base" />
                Favoritos
                {favCount > 0 && (
                  <span className="ml-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#00D2C4] px-1 text-[10px] font-black text-[#0A0A0A]">
                    {favCount > 99 ? '99+' : favCount}
                  </span>
                )}
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/resenas" className={navLinkClass}>
                <i className="ti ti-star text-base" />
                Reseñas
              </NavLink>
              <NavLink onClick={handleNavClick} to="/client/reservar" className={navLinkClass}>
                <i className="ti ti-calendar-event text-base" />
                Reservar
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {cartOpen && <CartModal onClose={() => setCartOpen(false)} />}
    </>
  );
}
