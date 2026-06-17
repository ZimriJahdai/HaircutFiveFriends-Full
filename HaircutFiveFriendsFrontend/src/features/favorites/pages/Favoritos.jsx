import { useState, useMemo } from 'react';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { FavoritesHeader } from '../components/FavoritesHeader.jsx';
import { FavoritesEmptyState } from '../components/FavoritesEmptyState.jsx';
import { FavoriteCard } from '../components/FavoriteCard.jsx';
import { useFavorites } from '../hooks/useFavorites.js';

const TABS = [
  { id: 'ALL', label: 'Todos', icon: 'ti-apps' },
  { id: 'HAIRCUT', label: 'Cortes', icon: 'ti-scissors' },
  { id: 'PRODUCT', label: 'Productos', icon: 'ti-package' },
  { id: 'SERVICE', label: 'Servicios', icon: 'ti-cut' },
  { id: 'BARBER', label: 'Barberos', icon: 'ti-user' }
];

export const Favoritos = () => {
  const { favorites, loading, clearFavorites } = useFavorites();
  const [activeTab, setActiveTab] = useState('ALL');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const countsMap = { ALL: favorites.length, HAIRCUT: 0, PRODUCT: 0, SERVICE: 0, BARBER: 0 };
    favorites.forEach((fav) => {
      if (fav.typeFavorite && countsMap[fav.typeFavorite] !== undefined) {
        countsMap[fav.typeFavorite]++;
      }
    });
    return countsMap;
  }, [favorites]);

  const tabFiltered = useMemo(() => {
    if (activeTab === 'ALL') return favorites;
    return favorites.filter((fav) => fav.typeFavorite === activeTab);
  }, [favorites, activeTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tabFiltered;
    return tabFiltered.filter((fav) =>
      fav.referenceId?.name?.toLowerCase().includes(q) ||
      fav.referenceId?.description?.toLowerCase().includes(q)
    );
  }, [tabFiltered, query]);

  const getVariant = () => {
    if (loading) return 'loading';
    if (favorites.length === 0) return 'empty';
    if (tabFiltered.length === 0) return 'unavailable';
    if (query && filtered.length === 0) return 'no-results';
    return null;
  };

  const variant = getVariant();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <FavoritesHeader showClear={favorites.length > 0} onClear={clearFavorites} />

        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-[#1A1A1A] pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setQuery('');
              }}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 focus:outline-none',
                activeTab === tab.id
                  ? 'bg-[#00D2C4] text-[#0A0A0A] shadow-[0_0_12px_rgba(0,210,196,0.3)]'
                  : 'bg-[#111] hover:bg-[#1A1A1A] text-white hover:text-[#00D2C4] border border-[#222]'
              ].join(' ')}
            >
              <i className={`ti ${tab.icon} text-[15px]`} aria-hidden="true" />
              <span>{tab.label}</span>
              <span className={[
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                activeTab === tab.id ? 'bg-[#0A0A0A]/20 text-[#0A0A0A]' : 'bg-[#222] text-[#888]'
              ].join(' ')}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {variant ? (
          <FavoritesEmptyState
            variant={variant}
            onAction={variant === 'unavailable' ? () => setActiveTab('ALL') : () => setQuery('')}
            query={query}
          />
        ) : (
          <>
            {/* Search Input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
              <div className="relative flex-1 max-w-md">
                <i
                  className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A5A] text-[16px] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar en mis favoritos…"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#111] border border-[#2A2A2A] rounded-xl text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#00D2C4]/50 focus:ring-1 focus:ring-[#00D2C4]/20 transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] hover:text-[#E8E4DC] transition-colors focus:outline-none"
                  >
                    <i className="ti ti-x text-[14px]" aria-hidden="true" />
                  </button>
                )}
              </div>

              {favorites.length > 0 && (
                <p className="text-[12px] text-[#5A5A5A] shrink-0">
                  {query ? (
                    <>
                      Encontrados <span className="text-[#00D2C4] font-semibold">{filtered.length}</span>
                      {' '}de {tabFiltered.length} favoritos
                    </>
                  ) : (
                    <>
                      <span className="text-[#E8E4DC] font-semibold">{tabFiltered.length}</span>
                      {' '}favoritos en esta sección
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((fav) => (
                <FavoriteCard key={fav._id} favorite={fav} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
