import { useEffect, useState } from 'react';
import { createSale, updateSale, getClients, getProducts, getServices } from '../../../shared/api/sales';
import { CardFields, EMPTY_CARD } from './CardFields';

const EMPTY_ITEM = { type: 'PRODUCT', referenceId: '', quantity: 1 };

const INPUT = 'bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors w-full';
const LABEL = 'text-[12px] text-[#5A5A5A] font-medium';

const refId = (o) => o?._id || o?.id;

export const SaleModal = ({ editing, onClose, onSuccess }) => {
  const [clients, setClients]   = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingRef, setLoadingRef] = useState(true);

  const [form, setForm] = useState({
    clientId:      editing?.clientId?._id || editing?.clientId || '',
    saleType:      editing?.saleType      || 'LOCAL',
    paymentMethod: editing?.paymentMethod || 'EFECTIVO',
    addressSale:   editing?.addressSale   || '',
    saleDate:      editing?.saleDate
      ? new Date(editing.saleDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    status:        editing?.status        || 'PENDIENTE',
  });

  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [card, setCard] = useState({ ...EMPTY_CARD });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getClients(), getProducts(), getServices()])
      .then(([c, p, s]) => {
        setClients(c.data?.data || c.data?.clients || []);
        setProducts((p.data?.data || p.data?.products || []).filter((pr) => pr.status === 'active'));
        setServices(s.data?.data || s.data?.services || []);
      })
      .catch(() => setError('No se pudieron cargar clientes, productos o servicios'))
      .finally(() => setLoadingRef(false));
  }, []);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  /* ── items helpers ── */
  const addItem = () => setItems((it) => [...it, { ...EMPTY_ITEM }]);

  const removeItem = (idx) => setItems((it) => it.filter((_, i) => i !== idx));

  const setItemField = (idx, field, value) =>
    setItems((it) => it.map((item, i) =>
      i === idx ? { ...item, [field]: value, ...(field === 'type' ? { referenceId: '' } : {}) } : item
    ));

  const optionsFor = (type) => (type === 'SERVICE' ? services : products);

  const priceLabel = (type, o) => (type === 'SERVICE' ? o.price : `Q${o.price}`);

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!editing) {
      const invalid = items.some((it) => !it.referenceId || it.quantity < 1);
      if (invalid) { setError('Completa todos los productos/servicios antes de guardar'); return; }
    }

    setSubmitting(true);
    try {
      if (editing) {
        await updateSale(editing._id, {
          saleType:      form.saleType,
          paymentMethod: form.paymentMethod,
          addressSale:   form.addressSale,
          saleDate:      form.saleDate,
          status:        form.status,
        });
        onSuccess('Venta actualizada exitosamente');
      } else {
        await createSale({
          clientId:      form.clientId,
          saleType:      form.saleType,
          paymentMethod: form.paymentMethod,
          addressSale:   form.saleType === 'DOMICILIO' ? form.addressSale : undefined,
          saleDate:      form.saleDate,
          details:       items.map((it) => ({
            referenceId: it.referenceId,
            detailType:  it.type,
            quantity:    Number(it.quantity),
          })),
        });
        onSuccess('Venta creada exitosamente');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar la venta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div
        className="bg-[#181818] border border-[#2A2A2A] rounded-xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2A2A2A]">
          <h2 className="text-[16px] font-semibold text-[#E8E4DC] m-0">
            {editing ? 'Editar venta' : 'Nueva venta'}
          </h2>
          <button
            className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer p-0.5 leading-none transition-colors focus:outline-none"
            onClick={onClose} aria-label="Cerrar"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">

            {loadingRef ? (
              <div className="flex items-center gap-2 text-[13px] text-[#5A5A5A] py-4">
                <div className="w-4 h-4 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
                Cargando datos…
              </div>
            ) : (
              <>
                {/* Cliente (solo al crear) */}
                {!editing && (
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL} htmlFor="sale-client">Cliente *</label>
                    <select
                      id="sale-client"
                      className={INPUT}
                      value={form.clientId}
                      onChange={(e) => setField('clientId', e.target.value)}
                      required
                    >
                      <option value="">Seleccionar cliente…</option>
                      {clients.map((c) => (
                        <option key={refId(c)} value={refId(c)}>{c.name} — {c.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Fecha + Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL} htmlFor="sale-date">Fecha de venta</label>
                    <input
                      id="sale-date"
                      type="datetime-local"
                      className={INPUT}
                      value={form.saleDate}
                      onChange={(e) => setField('saleDate', e.target.value)}
                    />
                  </div>
                  {editing && (
                    <div className="flex flex-col gap-1.5">
                      <label className={LABEL} htmlFor="sale-status">Estado</label>
                      <select
                        id="sale-status"
                        className={INPUT}
                        value={form.status}
                        onChange={(e) => setField('status', e.target.value)}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="COMPLETADO">Completado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Tipo + Método */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL} htmlFor="sale-type">Tipo de venta</label>
                    <select
                      id="sale-type"
                      className={INPUT}
                      value={form.saleType}
                      onChange={(e) => setField('saleType', e.target.value)}
                    >
                      <option value="LOCAL">Local</option>
                      <option value="DOMICILIO">A domicilio</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL} htmlFor="sale-payment">Método de pago</label>
                    <select
                      id="sale-payment"
                      className={INPUT}
                      value={form.paymentMethod}
                      onChange={(e) => setField('paymentMethod', e.target.value)}
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                    </select>
                  </div>
                </div>

                {/* Dirección (domicilio) */}
                {form.saleType === 'DOMICILIO' && (
                  <div className="flex flex-col gap-1.5">
                    <label className={LABEL} htmlFor="sale-address">Dirección de entrega *</label>
                    <input
                      id="sale-address"
                      type="text"
                      className={INPUT}
                      placeholder="Ej: 5ta Avenida 10-50, Zona 1, Ciudad"
                      value={form.addressSale}
                      onChange={(e) => setField('addressSale', e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Datos de tarjeta */}
                {form.paymentMethod === 'TARJETA' && (
                  <CardFields variant="admin" value={card} onChange={setCard} />
                )}

                {/* Productos / Servicios (solo al crear) */}
                {!editing && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={LABEL}>Productos / Servicios *</span>
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-1.5 text-[12px] text-[#C9A84C] hover:text-[#D4B45C] bg-transparent border-none cursor-pointer transition-colors focus:outline-none"
                      >
                        <i className="ti ti-plus text-base" aria-hidden="true" />
                        Agregar ítem
                      </button>
                    </div>

                    {items.map((item, idx) => {
                      const opts = optionsFor(item.type);
                      return (
                        <div key={idx} className="flex gap-2 items-start bg-[#111] border border-[#222] rounded-lg p-3">
                          <div className="flex flex-col gap-1 min-w-[100px]">
                            <label className="text-[10px] text-[#5A5A5A] uppercase tracking-[1px]">Tipo</label>
                            <select
                              className="bg-[#181818] border border-[#2A2A2A] rounded-md px-2 py-1.5 text-[12px] text-[#E8E4DC] outline-none"
                              value={item.type}
                              onChange={(e) => setItemField(idx, 'type', e.target.value)}
                            >
                              <option value="PRODUCT">Producto</option>
                              <option value="SERVICE">Servicio</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] text-[#5A5A5A] uppercase tracking-[1px]">
                              {item.type === 'SERVICE' ? 'Servicio' : 'Producto'}
                            </label>
                            <select
                              className="bg-[#181818] border border-[#2A2A2A] rounded-md px-2 py-1.5 text-[12px] text-[#E8E4DC] outline-none"
                              value={item.referenceId}
                              onChange={(e) => setItemField(idx, 'referenceId', e.target.value)}
                              required
                            >
                              <option value="">Seleccionar…</option>
                              {opts.map((o) => (
                                <option key={refId(o)} value={refId(o)}>
                                  {o.name} — {priceLabel(item.type, o)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1 w-20">
                            <label className="text-[10px] text-[#5A5A5A] uppercase tracking-[1px]">Cant.</label>
                            <input
                              type="number"
                              min="1"
                              className="bg-[#181818] border border-[#2A2A2A] rounded-md px-2 py-1.5 text-[12px] text-[#E8E4DC] outline-none text-center"
                              value={item.quantity}
                              onChange={(e) => setItemField(idx, 'quantity', e.target.value)}
                              required
                            />
                          </div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="mt-5 bg-transparent border-none text-[#5A5A5A] hover:text-[#E07070] cursor-pointer transition-colors focus:outline-none"
                              aria-label="Quitar ítem"
                            >
                              <i className="ti ti-trash text-base" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
                <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[#2A2A2A]">
            <button
              type="button"
              className="bg-transparent hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-md px-4 py-2 text-[13px] cursor-pointer transition-colors focus:outline-none"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || loadingRef}
              className="bg-[#C9A84C] hover:bg-[#D4B45C] disabled:bg-[#5A4A2A] disabled:opacity-60 text-[#0A0A0A] border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
            >
              {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
