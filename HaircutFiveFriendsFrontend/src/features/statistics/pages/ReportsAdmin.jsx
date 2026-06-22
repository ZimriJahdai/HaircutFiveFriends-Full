import { useState } from 'react';
import { useDashboardStats } from '../../auth/hooks/useDashboardStats.js';
import { downloadAdminStatisticsPdf } from '../../../shared/api/statisticsService.js';

const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return 'Q0.00';
  return `Q${Number(value).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const ReportsAdmin = () => {
  const { stats, loading, error } = useDashboardStats();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const blob = await downloadAdminStatisticsPdf();
      downloadFile(blob, 'reporte-estadistico-admin.pdf');
    } catch (err) {
      setDownloadError(err.response?.data?.message || err.message || 'No se pudo descargar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-6 py-8 font-sans">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-['Bebas_Neue',sans-serif] tracking-[2px] text-[#E8E4DC] mb-2">Reportes administrativos</h1>
            <p className="text-[#9E9E9E] text-sm max-w-2xl">Descarga el reporte global de ventas y consulta un resumen rápido de tus estadísticas administrativas.</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || loading}
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B45C] text-[#0A0A0A] font-semibold px-5 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Generando PDF...' : 'Descargar reporte PDF'}
          </button>
        </div>

        {(error || downloadError) && (
          <div className="mb-6 rounded-xl border border-[#5A2020] bg-[#1A0A0A] p-4 text-sm text-[#E07070]">
            {error || downloadError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <div className="text-xs uppercase tracking-[2px] text-[#5A5A5A] mb-3">Ventas completadas</div>
            <div className="text-4xl font-['Bebas_Neue',sans-serif] text-[#E8E4DC]">{loading ? '—' : stats?.raw?.sales?.length ?? '—'}</div>
            <p className="mt-3 text-sm text-[#9E9E9E]">Ventas registradas actualmente.</p>
          </div>
          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <div className="text-xs uppercase tracking-[2px] text-[#5A5A5A] mb-3">Ingresos del mes</div>
            <div className="text-4xl font-['Bebas_Neue',sans-serif] text-[#E8E4DC]">{loading ? '—' : stats?.ingresosMes ?? '—'}</div>
            <p className="mt-3 text-sm text-[#9E9E9E]">Ventas completadas este mes.</p>
          </div>
          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <div className="text-xs uppercase tracking-[2px] text-[#5A5A5A] mb-3">Clientes totales</div>
            <div className="text-4xl font-['Bebas_Neue',sans-serif] text-[#E8E4DC]">{loading ? '—' : stats?.clientesActivos ?? '—'}</div>
            <p className="mt-3 text-sm text-[#9E9E9E]">Clientes registrados en tu barbería.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <h2 className="text-xl font-semibold text-[#E8E4DC] mb-4">Resumen rápido</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm text-[#B8B8B8]">
              <div>
                <dt className="text-[#9E9E9E]">Citas hoy</dt>
                <dd className="mt-2 text-lg text-white">{loading ? '—' : stats?.citasHoy ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[#9E9E9E]">Nuevos clientes</dt>
                <dd className="mt-2 text-lg text-white">{loading ? '—' : stats?.newClientsToday ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[#9E9E9E]">Barberos</dt>
                <dd className="mt-2 text-lg text-white">{loading ? '—' : stats?.totalBarberos ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[#9E9E9E]">Ingresos hoy</dt>
                <dd className="mt-2 text-lg text-white">{loading ? '—' : stats?.ingresosHoy ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <h2 className="text-xl font-semibold text-[#E8E4DC] mb-4">Detalles del reporte</h2>
            <p className="text-sm text-[#9E9E9E] mb-4">El PDF descargado incluirá un resumen global de ventas, ingresos totales y detalle de ventas completadas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
