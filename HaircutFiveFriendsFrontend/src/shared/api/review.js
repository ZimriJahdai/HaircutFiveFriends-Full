import { axiosAdmin } from './api';

const BASE = '/review';

export const getAllReviews = () => axiosAdmin.get(`${BASE}/obtener`).then(r => r.data);

export const getReviewsByBarbero = (barberoId) => axiosAdmin.get(`${BASE}/barbero/${barberoId}`).then(r => r.data);

export const createReview = (data) => axiosAdmin.post(`${BASE}/crear`, data).then(r => r.data);

export const deleteReview = (id) => axiosAdmin.delete(`${BASE}/eliminar/${id}`).then(r => r.data);
