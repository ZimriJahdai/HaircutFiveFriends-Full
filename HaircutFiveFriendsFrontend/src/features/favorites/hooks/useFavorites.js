import { useFavoritesStore } from '../store/useFavoritesStore';

/**
 * Hook de acceso al store de favoritos.
 * Expone las acciones y selectores listos para usar en cualquier componente.
 */
export const useFavorites = () => {
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);

  return { favoriteIds, toggleFavorite, isFavorite, clearFavorites };
};
