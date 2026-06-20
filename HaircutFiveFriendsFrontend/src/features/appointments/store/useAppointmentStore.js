import { create } from 'zustand';
import {
  getAppointments,
  getAppointmentsByDate,
  getMyAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from '../../../shared/api/appointment.js';

const extractError = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || fallback;

export const useAppointmentStore = create((set) => ({
  appointments: [],
  loading: false,
  error: null,

  // Admin/Employee: todas las citas o filtradas por fecha (YYYY-MM-DD)
  fetchAppointments: async (date = null) => {
    set({ loading: true, error: null });
    try {
      const res = date ? await getAppointmentsByDate(date) : await getAppointments();
      set({ appointments: res.data || [], loading: false });
    } catch (err) {
      set({ error: extractError(err, 'Error al cargar las citas'), loading: false });
    }
  },

  // Cliente: solo sus propias citas (resueltas por token)
  fetchMyAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMyAppointments();
      set({ appointments: res.data || [], loading: false });
    } catch (err) {
      set({ error: extractError(err, 'Error al cargar tus citas'), loading: false });
    }
  },

  createAppointment: async (payload) => {
    const res = await createAppointment(payload);
    return res.data;
  },

  updateAppointment: async (id, payload) => {
    const res = await updateAppointment(id, payload);
    set((state) => ({
      appointments: state.appointments.map((a) => (a._id === id ? res.data : a)),
    }));
    return res.data;
  },

  cancelAppointment: async (id) => {
    const res = await cancelAppointment(id);
    set((state) => ({
      appointments: state.appointments.map((a) => (a._id === id ? res.data : a)),
    }));
    return res.data;
  },

  clearError: () => set({ error: null }),
}));
