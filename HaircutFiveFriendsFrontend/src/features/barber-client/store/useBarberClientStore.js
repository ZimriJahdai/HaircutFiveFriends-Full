import { create } from 'zustand';
import { getBarbers } from '../../../shared/api/barber';

export const useBarberClientStore = create((set) => ({
  barbers: [],
  loading: false,
  error: null,

  getBarbers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getBarbers();
      set({
        barbers: response.data.data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al obtener los barberos',
        loading: false,
      });
    }
  },
}));
