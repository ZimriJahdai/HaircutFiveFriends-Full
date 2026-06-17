import { axiosAdmin } from './api';

export const getFavorites = (typeFavorite) => {
  const params = typeFavorite ? { typeFavorite } : {};
  return axiosAdmin.get('/favorites', { params });
};

export const createFavorite = (typeFavorite, referenceId) => {
  return axiosAdmin.post('/favorites', { typeFavorite, referenceId });
};

export const deleteFavorite = (id) => {
  return axiosAdmin.delete(`/favorites/${id}`);
};
