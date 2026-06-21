import { create } from "zustand";
import { getClients as getClientsRequest } from "../../../shared/api";
import {
  createClient as createClientRequest,
  updateClient as updateClientRequest,
  deleteClient as deleteClientRequest,
} from "../../../shared/api/client";

function formatServerError(data) {
  if (data?.errors?.length > 0) {
    return data.errors.map((e) => `• ${e.msg}`).join('\n');
  }
  return data?.message || null;
}

export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  getClients: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getClientsRequest();
      set({
        clients: response.data.data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: formatServerError(error.response?.data) || "Error al obtener los clientes",
        loading: false,
      });
    }
  },

  createClient: async (data) => {
    try {
      set({ loading: true, error: null });
      await createClientRequest(data);
      await get().getClients();
      set({ loading: false });
    } catch (error) {
      set({
        error: formatServerError(error.response?.data) || "Error al crear el cliente",
        loading: false,
      });
      throw error;
    }
  },

  updateClient: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await updateClientRequest(id, data);
      await get().getClients();
      set({ loading: false });
    } catch (error) {
      set({
        error: formatServerError(error.response?.data) || "Error al actualizar el cliente",
        loading: false,
      });
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteClientRequest(id);
      await get().getClients();
      set({ loading: false });
    } catch (error) {
      set({
        error: formatServerError(error.response?.data) || "Error al eliminar el cliente",
        loading: false,
      });
      throw error;
    }
  },
}));
