import { axiosAdmin } from './api';

export const getAllReviews = () => axiosAdmin.get('/reviews');

export const getReviewsByBarbero = (barberoId) => axiosAdmin.get(`/reviews/barbero/${barberoId}`);

export const createReview = (data) => axiosAdmin.post('/reviews', data);

export const deleteReview = (id) => axiosAdmin.delete(`/reviews/${id}`);
