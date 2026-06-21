import { useCallback, useEffect, useMemo, useState } from 'react';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { getMySales, getMyClient } from '../../../shared/api/sales';
import { PurchaseModal } from '../components/PurchaseModal';

const STATUS_STYLE = {
  COMPLETADO: { bg: '#0A2A3A', text: '#5ABDD0', border: '#0A4A5A', label: 'Completado', icon: 'ti-circle-check' },
  PENDIENTE:  { bg: '#3A2A0A', text: '#00D2C4', border: '#1A4A40', label: 'Pendiente',  icon: 'ti-clock'        },
  CANCELADO:  { bg: '#3A0A0A', text: '#E07070', border: '#5A0A0A', label: 'Cancelado',  icon: 'ti-circle-x'     },
};

const fmt     = (n) => `Q${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const typeIcon    = (t) => (t === 'DOMICILIO' ? 'ti-home' : 'ti-building-store');
const typeLabel   = (t) => (t === 'DOMICILIO' ? 'A domicilio' : 'En local');
const payIcon     = (p) => (p === 'TARJETA' ? 'ti-credit-card' : 'ti-cash');

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PENDIENTE;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <i className={`ti ${s.icon} text-xs`} aria-hidden="true" />
      {s.label}
    </span>
  );
};

const SaleCard = ({ sale, onClick }) => {
  const details = sale.detailId || [];
  return (
    <div
      className="bg-[#111] border border-[#1E1E1E] hover:border-[#00D2C4]/25 rounded-2xl p-5 cursor-pointer transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)] group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#5A5A5A] mb-1">
            <i className={`ti ${typeIcon(sale.saleType)} text-xs`} aria-hidden="true" />
            {typeLabel(sale.saleType)}
            <span className="text-[#2A2A2A]">·</span>
            <i className={`ti ${payIcon(sale.paymentMethod)} text-xs`} aria-hidden="true" />
            {sale.paymentMethod}
          </div>
          <div className="text-[12px] text-[#444]">{fmtDate(sale.saleDate)}</div>
        </div>
        <StatusBadge status={sale.status} />
      </div>

      {/* Items summary */}
      <div className="flex flex-col gap-1 mb-4">
        {details.slice(0, 3).map((d, i) => (
          <div key={d._id || i} className="flex items-center justify-between text-[12px]">
            <span className="text-[#AAA]">
              {d.referenceId?.name || 'Ítem'} <span className="text-[#555]">×{d.quantity}</span>
            </span>
            <span className="text-[#E8E4DC]">{fmt(d.total)}</span>
          </div>
        ))}
        {details.length > 3 && (
          <div className="text-[11px] text-[#555]">+{details.length - 3} más…</div>
        )}
      </div>

      <div className="h-[1px] bg-[#1E1E1E] mb-3" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sale.totalPointsUsed > 0 && (
            <span className="text-[11px] text-[#C9A84C] bg-[#3A2A0A] border border-[#5A3A0A] rounded-full px-2 py-0.5">
              -{sale.totalPointsUsed} pts usados
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-['Bebas_Neue',sans-serif] text-xl tracking-[1px] text-[#00D2C4]">{fmt(sale.total)}</span>
          <i className="ti ti-chevron-right text-[#2A2A2A] group-hover:text-[#00D2C4] transition-colors text-base" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

const SaleDetailDrawer = ({ sale, onClose }) => {
  if (!sale) return null;
  const details = sale.detailId || [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div
        className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <h2 className="text-[15px] font-semibold text-[#E8E4DC] m-0">Detalle del pedido</h2>
            <StatusBadge status={sale.status} />
          </div>
          <button
            className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer transition-colors focus:outline-none"
            onClick={onClose}
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Fecha</div>
              <div className="text-[13px] text-[#E8E4DC]">{fmtDate(sale.saleDate)}</div>
            </div>
            <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Tipo</div>
              <div className="text-[13px] text-[#E8E4DC] flex items-center gap-1.5">
                <i className={`ti ${typeIcon(sale.saleType)} text-sm`} aria-hidden="true" />
                {typeLabel(sale.saleType)}
              </div>
            </div>
            <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Pago</div>
              <div className="text-[13px] text-[#E8E4DC] flex items-center gap-1.5">
                <i className={`ti ${payIcon(sale.paymentMethod)} text-sm`} aria-hidden="true" />
                {sale.paymentMethod === 'TARJETA' ? 'Tarjeta' : 'Efectivo'}
              </div>
            </div>
            <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Puntos usados</div>
              <div className="text-[13px] text-[#C9A84C]">{sale.totalPointsUsed > 0 ? `${sale.totalPointsUsed} pts` : '—'}</div>
            </div>
          </div>

          {sale.saleType === 'DOMICILIO' && sale.addressSale && (
            <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Dirección</div>
              <div className="text-[13px] text-[#E8E4DC]">{sale.addressSale}</div>
            </div>
          )}

          {/* Items */}
          <div>
            <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-2">Productos / Servicios</div>
            <div className="flex flex-col gap-2">
              {details.map((d, i) => (
                <div key={d._id || i} className="flex items-center justify-between bg-[#151515] border border-[#1E1E1E] rounded-xl px-4 py-3">
                  <div>
                    <div className="text-[13px] text-[#E8E4DC]">{d.referenceId?.name || 'Ítem'}</div>
                    {d.paidWithPoints && (
                      <div className="text-[11px] text-[#C9A84C] mt-0.5">Pagado con {d.pointsUsed} pts</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[12px] text-[#5A5A5A]">×{d.quantity}</span>
                    <span className="text-[13px] text-[#E8E4DC] font-medium">{fmt(d.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points message */}
          {sale.pointsMessage && (
            <div className="bg-[#1A3A1A] border border-[#2A5A2A] rounded-xl px-4 py-3 text-[12px] text-[#8EE] flex items-center gap-2">
              <i className="ti ti-star text-base" aria-hidden="true" />
              {sale.pointsMessage}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between bg-[#00D2C4]/5 border border-[#00D2C4]/20 rounded-xl px-4 py-3.5">
            <span className="text-[13px] text-[#5A5A5A]">Total</span>
            <span className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[1px] text-[#00D2C4]">{fmt(sale.total)}</span>
          </div>
        </div>

        <div className="flex justify-end px-5 py-4 border-t border-[#1E1E1E]">
          <button
            className="bg-transparent hover:bg-[#1A1A1A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-xl px-5 py-2.5 text-[13px] cursor-pointer transition-colors focus:outline-none"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export const SalesClient = () => {
  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [clientId, setClientId]     = useState('');
  const [points, setPoints]         = useState(0);
  const [filterStatus, setFilter]   = useState('ALL');
  const [detail, setDetail]         = useState(null);
  const [showPurchase, setShowPurchase] = useState(false);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMySales();
      setSales(res.data?.data || res.data?.sales || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tus compras');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClient = useCallback(async () => {
    try {
      const res = await getMyClient();
      setClientId(res.data?.data?._id || '');
      setPoints(res.data?.data?.points || 0);
    } catch {
      /* el cliente puede no tener registro de Mongo aún */
    }
  }, []);

  useEffect(() => { void loadSales(); void loadClient(); }, [loadSales, loadClient]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 5000);
    return () => clearTimeout(t);
  }, [success]);

  const stats = useMemo(() => ({
    total:      sales.length,
    pendientes: sales.filter((s) => s.status === 'PENDIENTE').length,
    gastado:    sales.filter((s) => s.status === 'COMPLETADO').reduce((a, s) => a + (s.total || 0), 0),
  }), [sales]);

  const filtered = useMemo(() => {
    if (filterStatus === 'ALL') return sales;
    return sales.filter((s) => s.status === filterStatus);
  }, [sales, filterStatus]);

  const FILTERS = [
    { key: 'ALL',        label: 'Todas' },
    { key: 'PENDIENTE',  label: 'Pendientes' },
    { key: 'COMPLETADO', label: 'Completadas' },
    { key: 'CANCELADO',  label: 'Canceladas' },
  ];

  const handlePurchaseSuccess = (msg) => {
    setShowPurchase(false);
    setSuccess(msg);
    void loadSales();
    void loadClient();
  };

  const openPurchase = () => {
    if (!clientId) {
      setError('No se encontró tu perfil de cliente. Recarga la página e inténtalo de nuevo.');
      return;
    }
    setShowPurchase(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0">Mis Compras</h1>
            <p className="text-[13px] text-[#5A5A5A] mt-1">Revisa el historial de tus pedidos y realiza nuevas compras.</p>
          </div>
          <button
            onClick={openPurchase}
            className="flex items-center gap-2 bg-[#00D2C4] hover:bg-[#00E8D8] text-[#0A0A0A] border-none rounded-xl px-5 py-3 text-[13px] font-bold cursor-pointer transition-colors focus:outline-none shadow-[0_0_16px_rgba(0,210,196,0.25)] shrink-0"
          >
            <i className="ti ti-shopping-cart text-base" aria-hidden="true" />
            Nueva compra
          </button>
        </div>

        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total compras',  value: stats.total,          color: '#E8E4DC' },
            { label: 'Pendientes',     value: stats.pendientes,     color: '#00D2C4' },
            { label: 'Total gastado',  value: `Q${stats.gastado.toFixed(2)}`, color: '#E8E4DC' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-[#1E1E1E] bg-[#111] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A] font-semibold">{label}</div>
              <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px]" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-[#152A2A] border border-[#205A50] rounded-xl px-4 py-3 text-[13px] text-[#8EE] mb-6 flex items-center gap-2">
            <i className="ti ti-circle-check text-lg" aria-hidden="true" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[13px] text-[#E88] mb-6 flex items-center gap-2">
            <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-xl px-4 py-2 text-[12px] font-medium border transition-colors cursor-pointer focus:outline-none ${
                filterStatus === key
                  ? 'bg-[#00D2C4] border-[#00D2C4] text-[#0A0A0A] shadow-[0_0_10px_rgba(0,210,196,0.25)]'
                  : 'bg-transparent border-[#1E1E1E] text-[#5A5A5A] hover:border-[#00D2C4]/40 hover:text-[#00D2C4]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-[#5A5A5A] text-[13px]">
            <div className="w-6 h-6 border-2 border-[#1E1E1E] border-t-[#00D2C4] rounded-full animate-spin" />
            <span>Cargando tus compras…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-[#5A5A5A]">
            <i className="ti ti-shopping-cart-off text-5xl text-[#2A2A2A]" aria-hidden="true" />
            <div className="text-center">
              <p className="text-[15px] font-medium text-[#444] mb-1">
                {filterStatus === 'ALL' ? 'Aún no tienes compras' : `Sin compras ${filterStatus.toLowerCase()}s`}
              </p>
              <p className="text-[13px]">Realiza tu primera compra y aparecerá aquí.</p>
            </div>
            <button
              onClick={openPurchase}
              className="flex items-center gap-2 bg-[#00D2C4] hover:bg-[#00E8D8] text-[#0A0A0A] border-none rounded-xl px-5 py-2.5 text-[13px] font-bold cursor-pointer transition-colors focus:outline-none"
            >
              <i className="ti ti-shopping-cart text-base" aria-hidden="true" />
              Comprar ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((sale) => (
              <SaleCard key={sale._id} sale={sale} onClick={() => setDetail(sale)} />
            ))}
          </div>
        )}
      </main>

      {showPurchase && (
        <PurchaseModal
          clientId={clientId}
          clientPoints={points}
          onClose={() => setShowPurchase(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {detail && (
        <SaleDetailDrawer sale={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
};
