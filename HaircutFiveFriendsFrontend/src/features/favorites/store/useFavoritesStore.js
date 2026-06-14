import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store de favoritos — persiste en localStorage automáticamente.
 * Guarda únicamente los IDs de los barberos marcados como favoritos.
 */
export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (id) => {
        const current = get().favoriteIds;
        const exists = current.includes(id);
        set({
          favoriteIds: exists
            ? current.filter((fId) => fId !== id)
            : [...current, id],
        });
      },

      isFavorite: (id) => get().favoriteIds.includes(id),

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'hff-favorites', // clave en localStorage
    }
  )
);
