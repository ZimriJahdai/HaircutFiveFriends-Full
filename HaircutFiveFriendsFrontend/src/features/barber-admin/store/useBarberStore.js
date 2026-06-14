import { create } from "zustand";
import { getBarbers as getBarbersRequest } from "../../../shared/api";
import {
  createBarber as createBarberRequest,
  updateBarber as updateBarberRequest,
  deleteBarber as deleteBarberRequest,
} from "../../../shared/api/barber";

export const useBarberStore = create((set, get) => ({
  barbers: [],
  loading: false,
  error: null,

  getBarbers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getBarbersRequest();
      set({
        barbers: response.data.data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error al obtener los barberos",
        loading: false,
      });
    }
  },

  createBarber: async (data) => {
    try {
      set({ loading: true, error: null });
      await createBarberRequest(data);
      await get().getBarbers();
      set({ loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error al crear el barbero",
        loading: false,
      });
      throw error;
    }
  },

  updateBarber: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await updateBarberRequest(id, data);
      await get().getBarbers();
      set({ loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error al actualizar el barbero",
        loading: false,
      });
      throw error;
    }
  },

  deleteBarber: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteBarberRequest(id);
      await get().getBarbers();
      set({ loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error al eliminar el barbero",
        loading: false,
      });
      throw error;
    }
  },
}));
