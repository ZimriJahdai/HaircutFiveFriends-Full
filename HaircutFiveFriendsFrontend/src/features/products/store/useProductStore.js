import { create } from 'zustand';
import { getProducts, getRedeemableProducts } from '../../../shared/api/product';

export const useProductStore = create((set) => ({
  products: [],
  redeemableProducts: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const [allResponse, redeemableResponse] = await Promise.all([
        getProducts(),
        getRedeemableProducts(),
      ]);
      const allProducts = allResponse.data?.data || [];
      set({
        products: allProducts.filter((product) => product.status === 'active'),
        redeemableProducts: redeemableResponse.data?.data || [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al cargar productos',
        loading: false,
      });
    }
  },
}));
