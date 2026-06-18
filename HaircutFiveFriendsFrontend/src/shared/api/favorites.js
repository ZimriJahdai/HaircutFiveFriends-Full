import { axiosAdmin } from './api';

export const getFavorites = (typeFavorite, config = {}) => {
  const params = typeFavorite ? { typeFavorite } : {};
  return axiosAdmin.get('/favorites', { params, ...config });
};

export const createFavorite = (typeFavorite, referenceId, config = {}) => {
  return axiosAdmin.post('/favorites', { typeFavorite, referenceId }, config);
};

export const deleteFavorite = (id, config = {}) => {
  return axiosAdmin.delete(`/favorites/${id}`, config);
};
