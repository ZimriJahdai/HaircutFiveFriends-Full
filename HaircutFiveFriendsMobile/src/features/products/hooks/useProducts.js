import { useCallback, useEffect, useState } from 'react';

import { apiClient, getApiError, unwrap } from '../../../shared/api';

// GET /products devuelve TODOS los productos (sin filtrar por estado): el
// filtro "activo" del catálogo es del lado del cliente. GET /products/redeemable
// ya viene filtrado por el backend (pointsPrice>0 && status==='active').
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [redeemable, setRedeemable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catalogRes, redeemableRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/products/redeemable'),
      ]);
      setProducts(unwrap(catalogRes) || []);
      setRedeemable(unwrap(redeemableRes) || []);
    } catch (err) {
      setError(getApiError(err, 'No fue posible cargar los productos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activeProducts = products.filter((product) => product.status === 'active');

  return { products: activeProducts, redeemable, loading, error, refetch: fetchAll };
}
