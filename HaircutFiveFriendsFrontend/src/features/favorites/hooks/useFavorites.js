import { useEffect } from 'react';
import { useFavoritesStore } from '../store/useFavoritesStore';

/**
 * Hook de acceso al store de favoritos.
 * Expone las acciones y selectores listos para usar en cualquier componente.
 */
export const useFavorites = () => {
  const favorites = useFavoritesStore((s) => s.favorites);
  const loading = useFavoritesStore((s) => s.loading);
  const error = useFavoritesStore((s) => s.error);
  const fetched = useFavoritesStore((s) => s.fetched);
  const fetchFavorites = useFavoritesStore((s) => s.fetchFavorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);

  useEffect(() => {
    const controller = new AbortController();
    fetchFavorites(false, controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchFavorites]);

  const favoriteIds = favorites.map((fav) => fav.referenceId?._id || fav.referenceId?.id || fav.referenceId);

  return {
    favorites,
    favoriteIds,
    loading,
    fetched,
    error,
    fetchFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    removeFavorite,
  };
};
