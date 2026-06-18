import { create } from 'zustand';
import { analyzeHaircut } from '../../../shared/api/aiHaircut';

// Estado del analisis IA del corte: resumen del rostro + imagen generada.
export const useTryOnStore = create((set) => ({
  faceSummary: null,
  haircutImageBase64: null,
  loading: false,
  error: null,

  analyze: async ({ imageBase64, mimeType, haircutName, description, length, style }) => {
    try {
      set({ loading: true, error: null, faceSummary: null, haircutImageBase64: null });
      const response = await analyzeHaircut({
        imageBase64,
        mimeType,
        haircutName,
        description,
        length,
        style,
      });
      const data = response.data || {};
      set({
        faceSummary: data.faceSummary || null,
        haircutImageBase64: data.haircutImageBase64 || null,
        loading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Error al analizar la imagen',
        loading: false,
      });
      throw error;
    }
  },

  reset: () => set({ faceSummary: null, haircutImageBase64: null, error: null }),
}));
