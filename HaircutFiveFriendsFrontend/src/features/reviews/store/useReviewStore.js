import { create } from "zustand";
import { getAllReviews } from "../../../shared/api/review";

export const useReviewStore = create((set) => ({
  reviews: [],
  loading: false,
  error: null,

  getReviews: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getAllReviews();
      set({ reviews: response.data || [], loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al obtener las reseñas", loading: false });
    }
  },
}));
