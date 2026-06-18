import { create } from 'zustand';
import { getFavorites as apiGetFavorites, createFavorite as apiCreateFavorite, deleteFavorite as apiDeleteFavorite } from '../../../shared/api/favorites';

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  favoriteIds: [],
  loading: false,
  fetched: false,
  error: null,

  fetchFavorites: async (force = false, signal = null) => {
    // Si ya se cargaron y no se está forzando una recarga, omitimos para evitar bucles infinitos
    if (get().fetched && !force && !get().loading) return;

    try {
      set({ loading: true, error: null });
      const response = await apiGetFavorites(undefined, signal ? { signal } : {});
      const favorites = response.data.data || [];
      const favoriteIds = favorites.map((fav) => fav.referenceId?._id || fav.referenceId?.id || fav.referenceId);
      set({ favorites, favoriteIds, fetched: true, loading: false });
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      set({
        error: error.response?.data?.message || 'Error al obtener favoritos',
        loading: false,
      });
    }
  },

  addFavorite: async (typeFavorite, referenceId) => {
    try {
      set({ loading: true, error: null });
      await apiCreateFavorite(typeFavorite, referenceId);
      await get().fetchFavorites(true); // Forzar recarga tras agregar
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al agregar favorito',
        loading: false,
      });
    }
  },

  removeFavorite: async (favoriteId) => {
    try {
      set({ loading: true, error: null });
      await apiDeleteFavorite(favoriteId);
      set((state) => {
        const nextFavorites = state.favorites.filter((fav) => fav._id !== favoriteId);
        const nextIds = nextFavorites.map((fav) => fav.referenceId?._id || fav.referenceId?.id || fav.referenceId);
        return {
          favorites: nextFavorites,
          favoriteIds: nextIds,
          loading: false,
        };
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al eliminar favorito',
        loading: false,
      });
    }
  },

  toggleFavorite: async (typeFavorite, referenceId) => {
    const currentFavs = get().favorites;
    const existing = currentFavs.find(
      (fav) =>
        fav.typeFavorite === typeFavorite &&
        (fav.referenceId?._id === referenceId || fav.referenceId === referenceId || fav.referenceId?.id === referenceId)
    );

    if (existing) {
      await get().removeFavorite(existing._id);
    } else {
      await get().addFavorite(typeFavorite, referenceId);
    }
  },

  isFavorite: (typeFavorite, referenceId) => {
    return get().favorites.some(
      (fav) =>
        fav.typeFavorite === typeFavorite &&
        (fav.referenceId?._id === referenceId || fav.referenceId === referenceId || fav.referenceId?.id === referenceId)
    );
  },

  clearFavorites: async () => {
    const currentFavs = get().favorites;
    if (currentFavs.length === 0) return;
    try {
      set({ loading: true, error: null });
      await Promise.all(currentFavs.map((fav) => apiDeleteFavorite(fav._id)));
      set({ favorites: [], favoriteIds: [], fetched: true, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al limpiar favoritos',
        loading: false,
      });
    }
  },
}));
