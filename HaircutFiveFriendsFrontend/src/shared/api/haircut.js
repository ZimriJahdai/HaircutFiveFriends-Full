import { axiosAdmin } from "./api";

export const getHaircut = () => {
    return axiosAdmin.get("/haircuts");
}

export const createHaircut = async (data) => {
    return await axiosAdmin.post("/haircuts/create", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const updateHaircut = async (id, data) => {
    return await axiosAdmin.put(`/haircuts/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export const deleteHaircut = async (id) => {
    return await axiosAdmin.delete(`/haircuts/${id}`);
}