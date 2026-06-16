import { axiosAdmin } from './api.js';

const BASE = '/service';

export const getAllServices     = ()            => axiosAdmin.get(`${BASE}/obtener`).then(r => r.data);
export const getServiceById     = (id)          => axiosAdmin.get(`${BASE}/obtener/${id}`).then(r => r.data);
export const getServicesByStatus= (status)      => axiosAdmin.get(`${BASE}/estado/${status}`).then(r => r.data);
export const getRedeemableServices = ()         => axiosAdmin.get(`${BASE}/redeemable`).then(r => r.data);
export const createService      = (data)        => axiosAdmin.post(`${BASE}/crear`, data).then(r => r.data);
export const updateService      = (id, data)    => axiosAdmin.put(`${BASE}/actualizar/${id}`, data).then(r => r.data);
export const deleteService      = (id)          => axiosAdmin.delete(`${BASE}/eliminar/${id}`).then(r => r.data);
