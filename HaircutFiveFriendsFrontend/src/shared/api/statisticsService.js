import { axiosAdmin } from './api.js';

export const downloadAdminStatisticsPdf = async () => {
  const response = await axiosAdmin.get('/statistics/pdf', {
    responseType: 'blob',
  });
  return response.data;
};

export const downloadClientStatisticsPdf = async () => {
  const response = await axiosAdmin.get('/statistics/client/pdf', {
    responseType: 'blob',
  });
  return response.data;
};
