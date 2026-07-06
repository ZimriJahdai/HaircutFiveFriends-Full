import { useEffect, useState } from 'react';
import { createSale, getProducts, getMyClient } from '../../../shared/api/sales';
import { useCartStore } from '../../cart/store/cartStore';
import { CardFields, EMPTY_CARD } from './CardFields';
import { PurchaseSuccessModal } from './PurchaseSuccessModal';

const INPUT = 'bg-[#111] border border-[#1E1E1E] focus:border-[#00D2C4] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors w-full';
const LABEL = 'text-[12px] text-[#5A5A5A] font-medium';

const refId = (o) => o?._id || o?.id;

// Fecha local en formato YYYY-MM-DD (evita corrimiento por zona horaria de toISOString)
const localDateStr = (d) => {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
};
const TODAY_STR = localDateStr(new Date());
const MAX_STR   = localDateStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

// Mapea los items del carrito global al formato interno de la compra
const mapInitial = (items) =>
  (items || []).map((ci) => ({
    referenceId: ci.id,
    name: ci.name,
    price: ci.price,
    pointsPrice: ci.pointsPrice,
    quantity: ci.quantity || 1,
    detailType: ci.type || 'PRODUCT',
  }));

export const PurchaseModal = ({ initialItems = [], onClose, onSuccess }) => {
  const clearCart = useCartStore((s) => s.clearCart);

  const [clientId, setClientId]       = useState('');
  const [points, setPoints]           = useState(0);
  const [products, setProducts]       = useState([]);
  const [loadingProd, setLoadingProd] = useState(true);
  const [cart, setCart]               = useState(() => mapInitial(initialItems));
  const [itemsWithPoints, setIWP]     = useState({});
  const [saleType, setSaleType]       = useState('LOCAL');
  const [address, setAddress]         = useState('');
  const [pickupDate, setPickupDate]   = useState(TODAY_STR);
  const [paymentMethod, setPayment]   = useState('EFECTIVO');
  const [card, setCard]               = useState({ ...EMPTY_CARD });
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [result, setResult]           = useState(null);

  // Perfil de cliente (id de Mongo + puntos)
  useEffect(() => {
    getMyClient()
      .then((r) => {
        setClientId(r.data?.data?._id || '');
        setPoints(r.data?.data?.points || 0);
      })
      .catch(() => setError('No se encontró tu perfil de cliente. Recarga la página e inténtalo de nuevo.'));
  }, []);

  // Catálogo de productos (+ completar pointsPrice de los items que vienen del carrito)
  useEffect(() => {
    getProducts()
      .then((r) => {
        const list = (r.data?.data || r.data?.products || []).filter((p) => p.status === 'active');
        setProducts(list);
        setCart((prev) =>
          prev.map((c) => {
            if (c.detailType !== 'PRODUCT' || c.pointsPrice != null) return c;
            const match = list.find((p) => refId(p) === c.referenceId);
            return match ? { ...c, pointsPrice: match.pointsPrice } : c;
          })
        );
      })
      .catch(() => setError('No se pudieron cargar los productos'))
      .finally(() => setLoadingProd(false));
  }, []);

  /* cart helpers */
  const inCart    = (id) => cart.find((c) => c.referenceId === id);
  const addToCart = (p)  => {
    const id = refId(p);
    if (!id || inCart(id)) return;
    setCart((c) => [...c, { referenceId: id, name: p.name, price: p.price, pointsPrice: p.pointsPrice, quantity: 1, detailType: 'PRODUCT' }]);
  };
  const removeFromCart = (id) => {
    setCart((c) => c.filter((x) => x.referenceId !== id));
    setIWP((w) => { const n = { ...w }; delete n[id]; return n; });
  };
  const setQty = (id, qty) =>
    setCart((c) => c.map((x) => (x.referenceId === id ? { ...x, quantity: Math.max(1, Number(qty)) } : x)));

  const togglePoints = (id, pointsPrice) => {
    const currentPts = cart.reduce((s, c) => (itemsWithPoints[c.referenceId] ? s + (c.pointsPrice || 0) * c.quantity : s), 0);
    const willUse = !itemsWithPoints[id];
    const item = cart.find((c) => c.referenceId === id);
    const delta = (pointsPrice || 0) * (item?.quantity || 1);
    const projected = willUse ? currentPts + delta : currentPts - delta;
    if (willUse && projected > points) {
      setError(`No tienes suficientes puntos para canjear este producto (necesitas ${delta} pts)`);
      return;
    }
    setError('');
    setIWP((w) => ({ ...w, [id]: willUse }));
  };

  const pointsToUse = cart.reduce((s, c) => (itemsWithPoints[c.referenceId] ? s + (c.pointsPrice || 0) * c.quantity : s), 0);
  const moneyTotal  = cart.reduce((s, c) => (!itemsWithPoints[c.referenceId] ? s + c.price * c.quantity : s), 0);
  const totalLabel  = `Q${moneyTotal.toFixed(2)}${pointsToUse > 0 ? ` + ${pointsToUse} pts` : ''}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) { setError('No se encontró tu perfil de cliente. Recarga la página e inténtalo de nuevo.'); return; }
    if (cart.length === 0) { setError('Tu carrito está vacío'); return; }
    if (saleType === 'DOMICILIO' && !address.trim()) { setError('Ingresa la dirección de entrega'); return; }

    // A domicilio: fecha de hoy automática. En local: fecha elegida (hoy … hoy+7 días)
    let saleDate;
    if (saleType === 'DOMICILIO') {
      saleDate = new Date().toISOString();
    } else {
      if (!pickupDate) { setError('Selecciona la fecha para recoger tu pedido'); return; }
      if (pickupDate < TODAY_STR || pickupDate > MAX_STR) {
        setError('La fecha debe estar entre hoy y máximo 7 días después.');
        return;
      }
      saleDate = new Date(`${pickupDate}T12:00:00`).toISOString();
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await createSale({
        clientId,
        saleType,
        paymentMethod,
        saleDate,
        addressSale: saleType === 'DOMICILIO' ? address : undefined,
        details:     cart.map((c) => ({ referenceId: c.referenceId, detailType: c.detailType, quantity: c.quantity })),
        itemsWithPoints: Object.fromEntries(Object.entries(itemsWithPoints).filter(([, v]) => v)),
      });

      const summary = {
        _id:           res.data?.sale?._id,
        items:         cart.map((c) => ({
          name: c.name, quantity: c.quantity, price: c.price,
          pointsPrice: c.pointsPrice, withPoints: !!itemsWithPoints[c.referenceId],
        })),
        moneyTotal,
        pointsToUse,
        saleType,
        paymentMethod,
        address:       saleType === 'DOMICILIO' ? address : '',
        saleDate,
      };

      clearCart();
      setResult(summary);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al procesar la compra');
    } finally {
      setSubmitting(false);
    }
  };

  // Tras crear la compra, mostrar el modal de resultado (con opción de cancelar)
  if (result) {
    return <PurchaseSuccessModal sale={result} onClose={() => onSuccess()} />;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-5" onClick={onClose}>
      <div
        className="bg-[#0F0F0F] border border-[#1E1E1E] rounded-2xl w-full max-w-[760px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#1E1E1E]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#E8E4DC] m-0">Finalizar compra</h2>
            <p className="text-[11px] text-[#5A5A5A] mt-0.5">
              Tienes <span className="text-[#00D2C4] font-semibold">{points}</span> puntos disponibles
            </p>
          </div>
          <button
            className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer transition-colors focus:outline-none"
            onClick={onClose} aria-label="Cerrar"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-6">

            {/* Carrito */}
            <div>
              <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A] mb-3">Tu carrito</div>
              {cart.length === 0 ? (
                <div className="text-[13px] text-[#5A5A5A] bg-[#151515] border border-[#1E1E1E] rounded-xl px-4 py-6 text-center">
                  Tu carrito está vacío. Agrega productos más abajo.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {cart.map((item) => (
                    <div key={item.referenceId} className="flex items-center gap-3 bg-[#151515] border border-[#1E1E1E] rounded-xl px-4 py-3">
                      <div className="flex-1">
                        <div className="text-[13px] text-[#E8E4DC] font-medium">{item.name}</div>
                        <div className="text-[12px] text-[#5A5A5A] mt-0.5">
                          {itemsWithPoints[item.referenceId]
                            ? <span className="text-[#C9A84C]">{item.pointsPrice * item.quantity} pts</span>
                            : <span className="text-[#00D2C4]">Q{(item.price * item.quantity).toFixed(2)}</span>}
                        </div>
                      </div>
                      {/* qty */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQty(item.referenceId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#1E1E1E] text-[#AAA] rounded cursor-pointer border-none hover:bg-[#2A2A2A] focus:outline-none"
                          aria-label="Disminuir"
                        >
                          <i className="ti ti-minus text-xs" aria-hidden="true" />
                        </button>
                        <span className="w-6 text-center text-[13px] text-[#E8E4DC]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.referenceId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#1E1E1E] text-[#AAA] rounded cursor-pointer border-none hover:bg-[#2A2A2A] focus:outline-none"
                          aria-label="Aumentar"
                        >
                          <i className="ti ti-plus text-xs" aria-hidden="true" />
                        </button>
                      </div>
                      {/* pay with points toggle */}
                      {item.pointsPrice > 0 && (
                        <button
                          type="button"
                          onClick={() => togglePoints(item.referenceId, item.pointsPrice)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer focus:outline-none ${
                            itemsWithPoints[item.referenceId]
                              ? 'bg-[#C9A84C]/20 border-[#C9A84C]/40 text-[#C9A84C]'
                              : 'bg-transparent border-[#2A2A2A] text-[#5A5A5A] hover:border-[#C9A84C]/40 hover:text-[#C9A84C]'
                          }`}
                          title={itemsWithPoints[item.referenceId] ? 'Quitar pago con puntos' : `Pagar con ${item.pointsPrice} pts`}
                        >
                          Puntos
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.referenceId)}
                        className="p-1 text-[#5A5A5A] hover:text-[#E07070] bg-transparent border-none cursor-pointer transition-colors focus:outline-none"
                        aria-label="Quitar del carrito"
                      >
                        <i className="ti ti-x text-sm" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} htmlFor="p-type">Tipo de entrega</label>
                <select id="p-type" className={INPUT} value={saleType} onChange={(e) => setSaleType(e.target.value)}>
                  <option value="LOCAL">Recoger en local</option>
                  <option value="DOMICILIO">A domicilio</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} htmlFor="p-payment">Método de pago</label>
                <select id="p-payment" className={INPUT} value={paymentMethod} onChange={(e) => setPayment(e.target.value)}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
            </div>

            {saleType === 'DOMICILIO' ? (
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} htmlFor="p-address">Dirección de entrega *</label>
                <input
                  id="p-address"
                  type="text"
                  className={INPUT}
                  placeholder="Ej: 5ta Avenida 10-50, Zona 1, Guatemala"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <span className="text-[11px] text-[#5A5A5A]">El pedido a domicilio se registra con la fecha de hoy.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} htmlFor="p-pickup">Fecha para recoger en tienda *</label>
                <input
                  id="p-pickup"
                  type="date"
                  className={INPUT}
                  min={TODAY_STR}
                  max={MAX_STR}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
                <span className="text-[11px] text-[#5A5A5A]">Puedes elegir desde hoy hasta un máximo de 7 días.</span>
              </div>
            )}

            {/* Datos de tarjeta */}
            {paymentMethod === 'TARJETA' && (
              <CardFields variant="client" value={card} onChange={setCard} />
            )}

            {/* Total summary */}
            {cart.length > 0 && (
              <div className="flex items-center justify-between bg-[#00D2C4]/5 border border-[#00D2C4]/20 rounded-xl px-4 py-3">
                <span className="text-[13px] text-[#5A5A5A]">Total estimado</span>
                <span className="font-['Bebas_Neue',sans-serif] text-xl tracking-[1px] text-[#00D2C4]">{totalLabel}</span>
              </div>
            )}

            {error && (
              <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[12px] text-[#E88] flex items-center gap-2">
                <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Catálogo (al final) — agregar más productos */}
            <div className="border-t border-[#1E1E1E] pt-5">
              <div className="text-[13px] font-semibold text-[#E8E4DC] mb-1">¿Deseas agregar algo más?</div>
              <div className="text-[11px] text-[#5A5A5A] mb-3">Añade más productos del catálogo a tu compra.</div>
              {loadingProd ? (
                <div className="flex items-center gap-2 text-[13px] text-[#5A5A5A] py-4">
                  <div className="w-4 h-4 border-2 border-[#1E1E1E] border-t-[#00D2C4] rounded-full animate-spin" />
                  Cargando…
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {products.map((p) => {
                    const id = refId(p);
                    const added = !!inCart(id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between bg-[#151515] border rounded-xl px-3 py-2.5 transition-colors"
                        style={{ borderColor: added ? '#00D2C430' : '#1E1E1E' }}
                      >
                        <div>
                          <div className="text-[13px] text-[#E8E4DC] font-medium">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] text-[#00D2C4] font-semibold">Q{p.price}</span>
                            {p.pointsPrice > 0 && (
                              <span className="text-[10px] text-[#C9A84C]">· {p.pointsPrice} pts</span>
                            )}
                            <span className="text-[10px] text-[#444]">Stock: {p.stock}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => (added ? removeFromCart(id) : addToCart(p))}
                          className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer focus:outline-none ${
                            added
                              ? 'bg-[#00D2C4]/10 border-[#00D2C4]/30 text-[#00D2C4]'
                              : 'bg-transparent border-[#2A2A2A] text-[#5A5A5A] hover:border-[#00D2C4] hover:text-[#00D2C4]'
                          }`}
                        >
                          {added ? 'Agregado' : 'Agregar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#1E1E1E] sticky bottom-0 bg-[#0F0F0F]">
            <button
              type="button"
              className="bg-transparent hover:bg-[#1A1A1A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-xl px-5 py-2.5 text-[13px] cursor-pointer transition-colors focus:outline-none"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="bg-[#00D2C4] hover:bg-[#00E8D8] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0A] border-none rounded-xl px-5 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none shadow-[0_0_12px_rgba(0,210,196,0.25)]"
            >
              {submitting ? 'Procesando…' : 'Confirmar compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
