const STATUS_STYLE = {
  COMPLETADO: { bg: '#0A2A3A', text: '#5ABDD0', border: '#0A4A5A', label: 'Completado' },
  PENDIENTE:  { bg: '#3A2A0A', text: '#C9A84C', border: '#5A3A0A', label: 'Pendiente'  },
  CANCELADO:  { bg: '#3A0A0A', text: '#E07070', border: '#5A0A0A', label: 'Cancelado'  },
};

const fmt = (n) => `Q${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const SaleDetailModal = ({ sale, onClose, onStatusChange, updatingStatus }) => {
  if (!sale) return null;

  const st = STATUS_STYLE[sale.status] || STATUS_STYLE.PENDIENTE;
  const client = sale.clientId;
  const details = sale.detailId || [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div
        className="bg-[#181818] border border-[#2A2A2A] rounded-xl w-full max-w-[680px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-semibold text-[#E8E4DC] m-0">Detalle de venta</h2>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: st.bg, color: st.text, borderColor: st.border }}
            >
              {st.label}
            </span>
          </div>
          <button
            className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer p-0.5 leading-none transition-colors focus:outline-none"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Meta info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Cliente</div>
              <div className="text-[13px] text-[#E8E4DC] font-medium">{client?.name || '—'}</div>
              <div className="text-[11px] text-[#5A5A5A]">{client?.email || ''}</div>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Fecha</div>
              <div className="text-[13px] text-[#E8E4DC]">{fmtDate(sale.saleDate)}</div>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Tipo</div>
              <div className="text-[13px] text-[#E8E4DC] flex items-center gap-1.5">
                <i className={`ti ${sale.saleType === 'DOMICILIO' ? 'ti-home' : 'ti-building-store'} text-sm`} aria-hidden="true" />
                {sale.saleType === 'DOMICILIO' ? 'A domicilio' : 'Local'}
              </div>
              {sale.saleType === 'DOMICILIO' && sale.addressSale && (
                <div className="text-[11px] text-[#5A5A5A] mt-0.5">{sale.addressSale}</div>
              )}
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Método de pago</div>
              <div className="text-[13px] text-[#E8E4DC] flex items-center gap-1.5">
                <i className={`ti ${sale.paymentMethod === 'TARJETA' ? 'ti-credit-card' : 'ti-cash'} text-sm`} aria-hidden="true" />
                {sale.paymentMethod === 'TARJETA' ? 'Tarjeta' : 'Efectivo'}
              </div>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Puntos usados</div>
              <div className="text-[13px] text-[#C9A84C] font-semibold">{sale.totalPointsUsed || 0} pts</div>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Total pagado</div>
              <div className="text-[15px] text-[#E8E4DC] font-['Bebas_Neue',sans-serif] tracking-[1px]">{fmt(sale.total)}</div>
            </div>
          </div>

          {/* Points message */}
          {sale.pointsMessage && (
            <div className="bg-[#3A2A0A] border border-[#5A3A0A] rounded-lg px-4 py-2.5 text-[12px] text-[#C9A84C] flex items-center gap-2">
              <i className="ti ti-star text-base" aria-hidden="true" />
              {sale.pointsMessage}
            </div>
          )}

          {/* Items */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-2">Productos / Servicios</div>
            {details.length === 0 ? (
              <div className="text-[13px] text-[#5A5A5A] py-4 text-center">Sin detalles registrados</div>
            ) : (
              <div className="flex flex-col gap-2">
                {details.map((d, i) => (
                  <div key={d._id || i} className="flex items-center justify-between bg-[#111] border border-[#222] rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded border"
                        style={d.detailType === 'SERVICE'
                          ? { background: '#1A2A3A', color: '#5ABDD0', borderColor: '#2A3A4A' }
                          : { background: '#1A1A2A', color: '#9A8ACA', borderColor: '#2A2A3A' }
                        }
                      >
                        {d.detailType === 'SERVICE' ? 'Servicio' : 'Producto'}
                      </span>
                      <div>
                        <div className="text-[13px] text-[#E8E4DC]">{d.referenceId?.name || d.referenceId || '—'}</div>
                        {d.paidWithPoints && (
                          <div className="text-[11px] text-[#C9A84C]">Pagado con {d.pointsUsed} pts</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="text-[12px] text-[#5A5A5A]">x{d.quantity}</div>
                      <div className="text-[13px] text-[#E8E4DC] font-medium">{fmt(d.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Change status */}
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-2">Cambiar estado</div>
            <div className="flex gap-2">
              {['PENDIENTE', 'COMPLETADO', 'CANCELADO'].map((s) => {
                const st2 = STATUS_STYLE[s];
                const isCurrent = sale.status === s;
                return (
                  <button
                    key={s}
                    disabled={isCurrent || updatingStatus}
                    onClick={() => onStatusChange(sale._id, s)}
                    className="flex-1 py-2 rounded-lg text-[12px] font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                    style={isCurrent
                      ? { background: st2.bg, color: st2.text, borderColor: st2.border }
                      : { background: 'transparent', color: '#5A5A5A', borderColor: '#2A2A2A' }
                    }
                  >
                    {updatingStatus && !isCurrent ? '…' : st2.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-5 py-3.5 border-t border-[#2A2A2A]">
          <button
            type="button"
            className="bg-transparent hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-md px-4 py-2 text-[13px] cursor-pointer transition-colors focus:outline-none"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
