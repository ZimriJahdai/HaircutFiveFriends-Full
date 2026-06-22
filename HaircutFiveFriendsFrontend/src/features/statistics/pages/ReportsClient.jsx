import { useState } from 'react';
import { useDashboardStats } from '../../auth/hooks/useDashboardStats.js';
import { downloadClientStatisticsPdf } from '../../../shared/api/statisticsService.js';
import NavbarClient from '../../client/components/NavbarClient.jsx';

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

const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return 'Q0.00';
  return `Q${Number(value).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const ReportsClient = () => {
  const { stats, loading, error } = useDashboardStats();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const blob = await downloadClientStatisticsPdf();
      downloadFile(blob, 'reporte-personal-cliente.pdf');
    } catch (err) {
      setDownloadError(err.response?.data?.message || err.message || 'No se pudo descargar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-6 py-8 font-sans">
      <NavbarClient />
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-['Bebas_Neue',sans-serif] tracking-[2px] text-[#E8E4DC] mb-2">Reporte personal</h1>
            <p className="text-[#9E9E9E] text-sm max-w-2xl">Descarga un PDF con tu resumen de citas, compras y puntos acumulados.</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || loading}
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B45C] text-[#0A0A0A] font-semibold px-5 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Generando PDF...' : 'Descargar mi reporte'}
          </button>
        </div>

        {(error || downloadError) && (
          <div className="mb-6 rounded-xl border border-[#5A2020] bg-[#1A0A0A] p-4 text-sm text-[#E07070]">
            {error || downloadError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <div className="text-xs uppercase tracking-[2px] text-[#5A5A5A] mb-3">Próxima cita</div>
            <div className="text-4xl font-['Bebas_Neue',sans-serif] text-[#E8E4DC]">{loading ? '—' : stats?.proximaCita ?? '—'}</div>
            <p className="mt-3 text-sm text-[#9E9E9E]">{loading ? '' : stats?.proximaCitaHora ?? 'Sin hora disponible'}</p>
          </div>
          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <div className="text-xs uppercase tracking-[2px] text-[#5A5A5A] mb-3">Total de citas</div>
            <div className="text-4xl font-['Bebas_Neue',sans-serif] text-[#E8E4DC]">{loading ? '—' : stats?.totalCitas ?? '—'}</div>
            <p className="mt-3 text-sm text-[#9E9E9E]">Número total de citas registradas.</p>
          </div>
          <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
            <div className="text-xs uppercase tracking-[2px] text-[#5A5A5A] mb-3">Puntos</div>
            <div className="text-4xl font-['Bebas_Neue',sans-serif] text-[#E8E4DC]">{loading ? '—' : stats?.puntos ?? '—'}</div>
            <p className="mt-3 text-sm text-[#9E9E9E]">Puntos acumulados en tu cuenta.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#272727] bg-[#111] p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#E8E4DC] mb-4">Qué incluye el reporte</h2>
          <ul className="space-y-3 text-sm text-[#B8B8B8]">
            <li>• Resumen de tus próximas citas y estado de tus reservas.</li>
            <li>• Total de citas registradas en tu cuenta.</li>
            <li>• Puntos acumulados y progreso de lealtad.</li>
            <li>• Historial de compras completadas en tu cuenta.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-[#272727] bg-[#111] p-6">
          <h2 className="text-xl font-semibold text-[#E8E4DC] mb-4">Consejo</h2>
          <p className="text-sm text-[#9E9E9E]">Descarga tu reporte antes de tu próxima visita para llevar un registro físico de tus citas y tus puntos. También puedes compartirlo con el equipo para solicitar servicios adicionales.</p>
        </div>
      </div>
    </div>
  );
};
