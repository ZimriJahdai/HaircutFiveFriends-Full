import { useCallback, useState } from 'react';

import { apiClient, getApiError, getId, unwrap } from '../../../shared/api';
import { SALE_DETAIL_TYPES } from '../../../shared/constants';
import { useClientProfileStore } from '../../../shared/store/clientProfileStore';

// Compartido por Productos (canje de puntos) y Facturas (historial de compras).
// El backend NO resuelve `clientId` a partir del token en /sales/* (a
// diferencia de appointments/favorites/review) — hay que enviarlo explícito.
export function useSales() {
  const [loading, setLoading] = useState(false);
  const clientId = useClientProfileStore((state) => state.clientId);
  const refreshPoints = useClientProfileStore((state) => state.refreshPoints);

  const redeemWithPoints = useCallback(
    async (item, detailType = SALE_DETAIL_TYPES.PRODUCT) => {
      if (!clientId) return { ok: false, error: 'Tu perfil de cliente aún no está listo' };
      setLoading(true);
      try {
        const referenceId = getId(item);
        const res = await apiClient.post('/sales/create', {
          clientId,
          saleDate: new Date().toISOString(),
          details: [{ referenceId, detailType, quantity: 1 }],
          itemsWithPoints: { [referenceId]: true },
        });
        await refreshPoints();
        return { ok: true, data: unwrap(res, 'sale') };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo canjear el producto') };
      } finally {
        setLoading(false);
      }
    },
    [clientId, refreshPoints]
  );

  const createSale = useCallback(
    async (details) => {
      if (!clientId) return { ok: false, error: 'Tu perfil de cliente aún no está listo' };
      setLoading(true);
      try {
        const res = await apiClient.post('/sales/create', {
          clientId,
          saleDate: new Date().toISOString(),
          details,
        });
        await refreshPoints();
        return { ok: true, data: unwrap(res, 'sale') };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo procesar el pago') };
      } finally {
        setLoading(false);
      }
    },
    [clientId, refreshPoints]
  );

  const fetchMySales = useCallback(async () => {
    try {
      const res = await apiClient.get('/sales/my-sales');
      return { ok: true, data: unwrap(res, 'sales') || [] };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No fue posible cargar tus compras') };
    }
  }, []);

  return { loading, redeemWithPoints, createSale, fetchMySales };
}
