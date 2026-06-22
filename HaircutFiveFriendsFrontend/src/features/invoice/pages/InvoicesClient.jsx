import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { fetchMySales } from '../../../shared/api/dashboardService.js';
import { downloadInvoicePdf } from '../../../shared/api/invoiceService.js';
import NavbarClient from '../../client/components/NavbarClient.jsx';

export const InvoicesClient = () => {
  const token = useAuthStore((state) => state.token);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(null);

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      setError('');
      try {
        if (!token) {
          throw new Error('Token de autenticación no disponible');
        }
        const response = await fetchMySales(token);
        setSales(response.sales || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'No se pudieron cargar tus facturas.');
      } finally {
        setLoading(false);
      }
    };

    void loadSales();
  }, [token]);

  const handleDownload = async (saleId) => {
    setDownloadLoading(saleId);
    try {
      const blob = await downloadInvoicePdf(saleId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${saleId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al descargar la factura');
    } finally {
      setDownloadLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />
      <div className="max-w-[1200px] w-full mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-['Bebas_Neue',sans-serif] text-5xl sm:text-6xl tracking-[3px] text-[#E8E4DC] leading-none mb-2">
            Mis facturas
          </h1>
          <p className="text-[#5A5A5A] text-[14px]">
            Aquí puedes descargar tus facturas en PDF para cada compra completada.
          </p>
        </div>

        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />

        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[13px] text-[#E88] mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#5A5A5A] text-[13px] gap-3">
            <div className="w-7 h-7 border-2 border-[#2A2A2A] border-t-[#00D2C4] rounded-full animate-spin" />
            Cargando facturas...
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-10 text-center text-[#A5A5A5]">
            Aún no tienes facturas registradas. Realiza una compra para ver tu historial.
          </div>
        ) : (
          <div className="grid gap-4">
            {sales.map((sale) => (
              <div key={sale._id} className="rounded-3xl border border-[#232323] bg-[#111] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[2px] text-[#5A5A5A] mb-2">Factura</div>
                    <div className="text-xl font-semibold text-[#E8E4DC]">Venta #{sale._id}</div>
                    <div className="text-sm text-[#A5A5A5] mt-1">
                      Fecha: {new Date(sale.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full bg-[#1E1E1E] px-3 py-1 text-xs uppercase tracking-[1px] text-[#C9A84C]">
                      Total: Q{sale.total?.toFixed(2) ?? '0.00'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(sale._id)}
                      disabled={downloadLoading === sale._id}
                      className="rounded-xl border border-[#00D2C4] bg-[#00D2C4]/10 px-4 py-2 text-sm font-semibold text-[#E8E4DC] transition hover:bg-[#00D2C4]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloadLoading === sale._id ? 'Descargando...' : 'Descargar PDF'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
