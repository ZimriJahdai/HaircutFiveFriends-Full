import { create } from "zustand";
import { getHaircut as getHaircutRequest } from "../../../shared/api";
import { 
    createHaircut as createHaircutRequest, 
    updateHaircut as updateHaircutRequest,
    deleteHaircut as deleteHaircutRequest
} from "../../../shared/api/haircut";

export const useHaircutStore = create((set, get) => ({
    haircut: [],
    loading: false,
    error: null,

    getHaircut: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getHaircutRequest();

            set({
                haircut: response.data.haircut || response.data.data || [],
                loading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error al obtener los cortes",
                loading: false,
            });
        }
    },

    createHaircut: async (data) => {
        try {
            set({ loading: true, error: null });
            await createHaircutRequest(data);
            await get().getHaircut(); // Refresh list after create
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error al crear el corte",
                loading: false,
            });
            throw error; // Rethrow to handle it in the component if needed
        }
    },

    updateHaircut: async (id, data) => {
        try {
            set({ loading: true, error: null });
            await updateHaircutRequest(id, data);
            await get().getHaircut(); // Refresh list after update
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error al actualizar el corte",
                loading: false,
            });
            throw error;
        }
    },

    deleteHaircut: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteHaircutRequest(id);
            await get().getHaircut(); // Refresh list after delete
            set({ loading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error al eliminar el corte",
                loading: false,
            });
            throw error;
        }
    }
}));