import { axiosAdmin } from './api.js';

export const downloadInvoicePdf = async (saleId) => {
  const response = await axiosAdmin.get(`/invoice/pdf/${saleId}`, {
    responseType: 'blob',
  });
  return response.data;
};
