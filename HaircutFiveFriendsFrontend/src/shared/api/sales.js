import { axiosAdmin } from './api';

export const getSales        = ()        => axiosAdmin.get('/sales');
export const getMySales      = ()        => axiosAdmin.get('/sales/my-sales');
export const getSaleById     = (id)      => axiosAdmin.get(`/sales/${id}`);
export const createSale      = (payload) => axiosAdmin.post('/sales/create', payload);
export const updateSale      = (id, payload) => axiosAdmin.put(`/sales/${id}`, payload);
export const cancelSale      = (id)      => axiosAdmin.put(`/sales/${id}/cancel`);
export const deleteSale      = (id)      => axiosAdmin.delete(`/sales/${id}`);

export const getClients      = ()        => axiosAdmin.get('/clients');
export const getMyClient     = ()        => axiosAdmin.get('/clients/me');
export const getProducts     = ()        => axiosAdmin.get('/products');
export const getServices     = ()        => axiosAdmin.get('/service/obtener');
