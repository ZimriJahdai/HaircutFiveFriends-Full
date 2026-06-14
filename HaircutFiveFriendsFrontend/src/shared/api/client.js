import { axiosAdmin } from "./api";

export const getClients = () => {
  return axiosAdmin.get("/clients");
};

export const getClientById = (id) => {
  return axiosAdmin.get(`/clients/${id}`);
};

export const createClient = async (data) => {
  return await axiosAdmin.post("/clients", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateClient = async (id, data) => {
  return await axiosAdmin.put(`/clients/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteClient = async (id) => {
  return await axiosAdmin.delete(`/clients/${id}`);
};
