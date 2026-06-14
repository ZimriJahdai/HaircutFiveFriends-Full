import { useState, useMemo } from 'react';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { FavoritesHeader } from '../components/FavoritesHeader.jsx';
import { FavoritesEmptyState } from '../components/FavoritesEmptyState.jsx';
import { FavoriteCard } from '../components/FavoriteCard.jsx';
import { BarberSearch } from '../../barber-client/components/BarberSearch.jsx';
import { useFavorites } from '../hooks/useFavorites.js';
import { useBarberClientStore } from '../../barber-client/store/useBarberClientStore.js';
import { useBarbers } from '../../barber-client/hooks/useBarbers.js';

export const Favoritos = () => {
  useBarbers();

  const barbers = useBarberClientStore((s) => s.barbers);
  const loading = useBarberClientStore((s) => s.loading);
  const { favoriteIds, clearFavorites } = useFavorites();
  const [query, setQuery] = useState('');

  const favoriteBarbers = useMemo(
    () => barbers.filter((b) => favoriteIds.includes(b._id)),
    [barbers, favoriteIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? favoriteBarbers.filter((b) => b.name?.toLowerCase().includes(q)) : favoriteBarbers;
  }, [favoriteBarbers, query]);

  const getVariant = () => {
    if (loading) return 'loading';
    if (favoriteIds.length === 0) return 'empty';
    if (favoriteBarbers.length === 0) return 'unavailable';
    if (query && filtered.length === 0) return 'no-results';
    return null;
  };

  const variant = getVariant();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <FavoritesHeader showClear={favoriteBarbers.length > 0} onClear={clearFavorites} />

        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />

        {variant ? (
          <FavoritesEmptyState
            variant={variant}
            onAction={variant === 'unavailable' ? clearFavorites : () => setQuery('')}
            query={query}
          />
        ) : (
          <>
            <BarberSearch
              query={query}
              onChange={setQuery}
              total={favoriteBarbers.length}
              filtered={filtered.length}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((barber) => (
                <FavoriteCard key={barber._id} barber={barber} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
