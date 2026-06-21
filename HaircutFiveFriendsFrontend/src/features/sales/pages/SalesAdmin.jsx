import { useEffect, useMemo, useState } from 'react';
import { getSales, deleteSale, updateSale } from '../../../shared/api/sales';
import { SaleModal } from '../components/SaleModal';
import { SaleDetailModal } from '../components/SaleDetailModal';

const STATUS_STYLE = {
  COMPLETADO: { bg: '#0A2A3A', text: '#5ABDD0', border: '#0A4A5A', label: 'Completado' },
  PENDIENTE:  { bg: '#3A2A0A', text: '#C9A84C', border: '#5A3A0A', label: 'Pendiente'  },
  CANCELADO:  { bg: '#3A0A0A', text: '#E07070', border: '#5A0A0A', label: 'Cancelado'  },
};

const fmt     = (n) => `Q${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const typeIcon  = (t) => (t === 'DOMICILIO' ? 'ti-home' : 'ti-building-store');
const typeLabel = (t) => (t === 'DOMICILIO' ? 'Domicilio' : 'Local');
const payIcon   = (p) => (p === 'TARJETA' ? 'ti-credit-card' : 'ti-cash');

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PENDIENTE;
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
};

export const SalesAdmin = () => {
  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [filterStatus, setFilter]   = useState('ALL');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [detail, setDetail]         = useState(null);
  const [updatingStatus, setUpdSt]  = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSales();
      setSales(res.data?.data || res.data?.sales || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const stats = useMemo(() => ({
    total:      sales.length,
    ingresos:   sales.filter(s => s.status === 'COMPLETADO').reduce((acc, s) => acc + (s.total || 0), 0),
    pendientes: sales.filter(s => s.status === 'PENDIENTE').length,
    canceladas: sales.filter(s => s.status === 'CANCELADO').length,
  }), [sales]);

  const filtered = useMemo(() => {
    let list = filterStatus === 'ALL' ? sales : sales.filter(s => s.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.clientId?.name || '').toLowerCase().includes(q) ||
        (s.clientId?.email || '').toLowerCase().includes(q) ||
        (s._id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [sales, filterStatus, search]);

  const openCreate = () => { setEditing(null); setShowModal(true); setError(''); };
  const openEdit   = (s)  => { setEditing(s);   setShowModal(true); setError(''); setDetail(null); };
  const closeModal = ()   => { setShowModal(false); setEditing(null); };

  const handleSuccess = (msg) => {
    setSuccess(msg);
    closeModal();
    void load();
  };

  const handleDelete = async (sale) => {
    if (!window.confirm(`¿Eliminar esta venta de ${sale.clientId?.name || 'cliente'}?`)) return;
    setError('');
    try {
      await deleteSale(sale._id);
      setSuccess('Venta eliminada exitosamente');
      void load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar la venta');
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdSt(true);
    try {
      await updateSale(id, { status });
      setDetail(d => d ? { ...d, status } : d);
      setSales(list => list.map(s => s._id === id ? { ...s, status } : s));
      setSuccess('Estado actualizado');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setUpdSt(false);
    }
  };

  const FILTERS = ['ALL', 'PENDIENTE', 'COMPLETADO', 'CANCELADO'];
  const FILTER_LABELS = { ALL: 'Todas', PENDIENTE: 'Pendientes', COMPLETADO: 'Completadas', CANCELADO: 'Canceladas' };

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0">Ventas</h1>
          <p className="text-[13px] text-[#5A5A5A] mt-1">Gestiona, crea y supervisa todas las ventas del negocio.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#D4B45C] text-[#0A0A0A] border-none rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none shrink-0"
        >
          <i className="ti ti-plus text-base" aria-hidden="true" />
          Nueva venta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total ventas',  value: stats.total,               color: '#E8E4DC' },
          { label: 'Ingresos',      value: fmt(stats.ingresos),       color: '#C9A84C' },
          { label: 'Pendientes',    value: stats.pendientes,          color: '#C9A84C' },
          { label: 'Canceladas',    value: stats.canceladas,          color: '#E07070' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">{label}</div>
            <div className="mt-2 font-['Bebas_Neue',sans-serif] text-3xl tracking-[2px]" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

      {/* Alerts */}
      {error && (
        <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[13px] text-[#E88] mb-4 flex items-center gap-2">
          <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#152A15] border border-[#205A20] rounded-xl px-4 py-3 text-[13px] text-[#8EE] mb-4 flex items-center gap-2">
          <i className="ti ti-circle-check text-lg" aria-hidden="true" />
          {success}
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3.5 py-1.5 text-[12px] font-medium border transition-colors cursor-pointer focus:outline-none ${
                filterStatus === f
                  ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]'
                  : 'bg-transparent border-[#2A2A2A] text-[#5A5A5A] hover:border-[#C9A84C] hover:text-[#E8E4DC]'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A5A] text-base pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar cliente…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-lg pl-9 pr-3 py-1.5 text-[13px] text-[#E8E4DC] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-[13px]">
          <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
          <span>Cargando ventas…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-[#5A5A5A]">
          <i className="ti ti-receipt-off text-4xl" aria-hidden="true" />
          <span className="text-[14px]">No hay ventas{filterStatus !== 'ALL' ? ' con ese filtro' : ''}</span>
          <button onClick={openCreate} className="text-[#C9A84C] text-[13px] underline underline-offset-2 bg-transparent border-none cursor-pointer">
            Crear la primera venta
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1E1E1E]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                {['Cliente', 'Fecha', 'Tipo', 'Pago', 'Puntos', 'Total', 'Estado', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] tracking-[1px] uppercase text-[#5A5A5A] font-medium bg-[#111]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(sale => (
                <tr
                  key={sale._id}
                  className="border-b border-[#151515] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                  onClick={() => setDetail(sale)}
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-[#E8E4DC]">{sale.clientId?.name || '—'}</div>
                    <div className="text-[11px] text-[#5A5A5A]">{sale.clientId?.email || ''}</div>
                  </td>
                  <td className="px-3 py-3 text-[#AAA] whitespace-nowrap">{fmtDate(sale.saleDate)}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px]">
                      <i className={`ti ${typeIcon(sale.saleType)} text-sm`} aria-hidden="true" />
                      {typeLabel(sale.saleType)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[#AAA]">
                    <span className="inline-flex items-center gap-1.5">
                      <i className={`ti ${payIcon(sale.paymentMethod)} text-sm`} aria-hidden="true" />
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[#C9A84C] text-[12px]">
                    {sale.totalPointsUsed > 0 ? `${sale.totalPointsUsed} pts` : '—'}
                  </td>
                  <td className="px-3 py-3 font-['Bebas_Neue',sans-serif] text-[15px] tracking-[1px] text-[#E8E4DC]">
                    {fmt(sale.total)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(sale)}
                        title="Editar"
                        className="p-1.5 text-[#5A5A5A] hover:text-[#C9A84C] bg-transparent border-none cursor-pointer transition-colors focus:outline-none"
                      >
                        <i className="ti ti-pencil text-base" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale)}
                        title="Eliminar"
                        className="p-1.5 text-[#5A5A5A] hover:text-[#E07070] bg-transparent border-none cursor-pointer transition-colors focus:outline-none"
                      >
                        <i className="ti ti-trash text-base" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SaleModal
          key={editing?._id || 'new'}
          editing={editing}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {detail && (
        <SaleDetailModal
          sale={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
          updatingStatus={updatingStatus}
        />
      )}
    </div>
  );
};
