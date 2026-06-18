import { create } from "zustand";
import {
  getAllReviews,
  createReview as createReviewRequest,
  deleteReview as deleteReviewRequest,
} from "../../../shared/api/review";

export const useReviewStore = create((set, get) => ({
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

  createReview: async (data) => {
    try {
      set({ error: null });
      await createReviewRequest(data);
      await get().getReviews();
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al crear la reseña" });
      throw error;
    }
  },

  deleteReview: async (id) => {
    try {
      set({ error: null });
      await deleteReviewRequest(id);
      await get().getReviews();
    } catch (error) {
      set({ error: error.response?.data?.message || "Error al eliminar la reseña" });
      throw error;
    }
  },
}));
