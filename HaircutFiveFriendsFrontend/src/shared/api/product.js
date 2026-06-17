import { axiosAdmin } from './api';

export const getProducts = () => axiosAdmin.get('/products');

export const getRedeemableProducts = () => axiosAdmin.get('/products/redeemable');

export const createProduct = async (data) => {
  return axiosAdmin.post('/products/create', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateProduct = async (id, data) => {
  return axiosAdmin.put(`/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProduct = async (id) => axiosAdmin.delete(`/products/${id}`);