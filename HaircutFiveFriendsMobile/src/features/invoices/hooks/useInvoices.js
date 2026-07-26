import { useCallback, useEffect, useState } from 'react';

import { apiClient, getApiError, getId } from '../../../shared/api';
import { saveAndSharePdf } from '../../../shared/utils/pdf';
import { useSales } from '../../sales/hooks/useSales';

export function useInvoices() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const { fetchMySales } = useSales();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchMySales();
    if (result.ok) setSales(result.data);
    else setError(result.error);
    setLoading(false);
  }, [fetchMySales]);

  useEffect(() => {
    load();
  }, [load]);

  // GET /invoice/pdf/:saleId devuelve el PDF crudo (no JSON) — se pide como
  // arraybuffer y se guarda/comparte con expo-file-system + expo-sharing.
  const downloadInvoice = useCallback(async (sale) => {
    const saleId = getId(sale);
    setDownloadingId(saleId);
    try {
      const res = await apiClient.get(`/invoice/pdf/${saleId}`, { responseType: 'arraybuffer' });
      await saveAndSharePdf(res.data, `factura-${saleId}.pdf`);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo descargar la factura') };
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return { sales, loading, error, refetch: load, downloadInvoice, downloadingId };
}
