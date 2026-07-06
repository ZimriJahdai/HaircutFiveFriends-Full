import { useState } from 'react';
import { cancelSale } from '../../../shared/api/sales';

const fmt = (n) => `Q${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const typeLabel = (t) => (t === 'DOMICILIO' ? 'A domicilio' : 'Recoger en local');
const payLabel  = (p) => (p === 'TARJETA' ? 'Tarjeta' : 'Efectivo');

export const PurchaseSuccessModal = ({ sale, onClose }) => {
  const [stage, setStage]         = useState('success'); // success | confirm | cancelled
  const [cancelling, setCancel]   = useState(false);
  const [error, setError]         = useState('');

  const handleConfirmCancel = async () => {
    setCancel(true);
    setError('');
    try {
      await cancelSale(sale._id);
      setStage('cancelled');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo cancelar la compra');
      setStage('success');
    } finally {
      setCancel(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[80] p-5" onClick={onClose}>
      <div
        className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Cancelada ── */}
        {stage === 'cancelled' ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#3A0A0A] border border-[#5A0A0A] flex items-center justify-center">
              <i className="ti ti-circle-x text-[#E07070] text-4xl" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-['Bebas_Neue',sans-serif] text-3xl tracking-[2px] text-[#E8E4DC] m-0">
                Compra cancelada
              </h2>
              <p className="text-[13px] text-[#5A5A5A] mt-1">La compra fue cancelada con éxito.</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 bg-[#00D2C4] hover:bg-[#00E8D8] text-[#0A0A0A] border-none rounded-xl px-6 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* ── Encabezado de éxito ── */}
            <div className="p-6 flex flex-col items-center text-center gap-3 border-b border-[#1E1E1E]">
              <div className="w-16 h-16 rounded-full bg-[#00D2C4]/10 border border-[#00D2C4]/30 flex items-center justify-center">
                <i className="ti ti-circle-check text-[#00D2C4] text-4xl" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-['Bebas_Neue',sans-serif] text-3xl tracking-[2px] text-[#E8E4DC] m-0">
                  ¡Compra realizada con éxito!
                </h2>
                <p className="text-[13px] text-[#5A5A5A] mt-1">Estos son los datos de tu compra.</p>
              </div>
            </div>

            {/* ── Datos de la compra ── */}
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Entrega</div>
                  <div className="text-[13px] text-[#E8E4DC]">{typeLabel(sale.saleType)}</div>
                </div>
                <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Pago</div>
                  <div className="text-[13px] text-[#E8E4DC]">{payLabel(sale.paymentMethod)}</div>
                </div>
                <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">
                    {sale.saleType === 'DOMICILIO' ? 'Fecha' : 'Recoger el'}
                  </div>
                  <div className="text-[13px] text-[#E8E4DC]">{fmtDate(sale.saleDate)}</div>
                </div>
                <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Estado</div>
                  <div className="text-[13px] text-[#00D2C4]">Pendiente</div>
                </div>
              </div>

              {sale.saleType === 'DOMICILIO' && sale.address && (
                <div className="bg-[#151515] border border-[#1E1E1E] rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-1">Dirección</div>
                  <div className="text-[13px] text-[#E8E4DC]">{sale.address}</div>
                </div>
              )}

              {/* Items */}
              <div>
                <div className="text-[10px] uppercase tracking-[1.5px] text-[#5A5A5A] mb-2">Productos</div>
                <div className="flex flex-col gap-2">
                  {sale.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#151515] border border-[#1E1E1E] rounded-xl px-4 py-3">
                      <div className="text-[13px] text-[#E8E4DC]">
                        {it.name} <span className="text-[#555]">×{it.quantity}</span>
                      </div>
                      <div className="text-[13px] font-medium">
                        {it.withPoints
                          ? <span className="text-[#C9A84C]">{(it.pointsPrice || 0) * it.quantity} pts</span>
                          : <span className="text-[#E8E4DC]">{fmt(it.price * it.quantity)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-[#00D2C4]/5 border border-[#00D2C4]/20 rounded-xl px-4 py-3.5">
                <span className="text-[13px] text-[#5A5A5A]">Total</span>
                <span className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[1px] text-[#00D2C4]">
                  {fmt(sale.moneyTotal)}{sale.pointsToUse > 0 ? ` + ${sale.pointsToUse} pts` : ''}
                </span>
              </div>

              {error && (
                <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[12px] text-[#E88] flex items-center gap-2">
                  <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                  {error}
                </div>
              )}

              {/* ── Confirmación de cancelación ── */}
              {stage === 'confirm' && (
                <div className="bg-[#1A1010] border border-[#5A2020] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[13px] text-[#E8E4DC]">
                    <i className="ti ti-alert-triangle text-[#E07070] text-lg" aria-hidden="true" />
                    ¿Estás seguro de que deseas cancelar esta compra?
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setStage('success')}
                      disabled={cancelling}
                      className="bg-transparent hover:bg-[#1A1A1A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-xl px-4 py-2 text-[12px] cursor-pointer transition-colors focus:outline-none disabled:opacity-50"
                    >
                      No, mantener
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={cancelling}
                      className="bg-[#E07070] hover:bg-[#E88] text-[#0A0A0A] border-none rounded-xl px-4 py-2 text-[12px] font-semibold cursor-pointer transition-colors focus:outline-none disabled:opacity-60"
                    >
                      {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {stage === 'success' && (
              <div className="flex justify-between gap-3 px-6 py-4 border-t border-[#1E1E1E]">
                <button
                  onClick={() => setStage('confirm')}
                  className="bg-transparent hover:bg-[#2A1515] border border-[#5A2020] text-[#E07070] rounded-xl px-5 py-2.5 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none"
                >
                  Cancelar compra
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#00D2C4] hover:bg-[#00E8D8] text-[#0A0A0A] border-none rounded-xl px-6 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none shadow-[0_0_12px_rgba(0,210,196,0.25)]"
                >
                  Cerrar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
