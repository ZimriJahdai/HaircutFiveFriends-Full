import { create } from 'zustand';
import { getAllServices } from '../../../shared/api/service.js';

export const useServiceStore = create((set) => ({
  services: [],
  loading: false,
  error: null,

  getServices: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getAllServices();
      set({ services: res.data || [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cargar servicios', loading: false });
    }
  },
}));
