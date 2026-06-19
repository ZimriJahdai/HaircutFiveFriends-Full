import { useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';

export const useProducts = () => {
  const products = useProductStore((s) => s.products);
  const redeemableProducts = useProductStore((s) => s.redeemableProducts);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, redeemableProducts, loading, error, refetchProducts: fetchProducts };
};
