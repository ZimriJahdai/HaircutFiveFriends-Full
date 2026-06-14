import { axiosAdmin } from "./api";

export const getBarbers = () => {
  return axiosAdmin.get("/barbers");
};

export const createBarber = async (data) => {
  return await axiosAdmin.post("/barbers", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateBarber = async (id, data) => {
  return await axiosAdmin.put(`/barbers/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteBarber = async (id) => {
  return await axiosAdmin.delete(`/barbers/${id}`);
};
