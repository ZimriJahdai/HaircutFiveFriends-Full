import { useState, useEffect } from 'react';
import { createService, updateService } from '../../../shared/api/service.js';

const CATEGORIES = [
  { value: 'CORTE_DE_CABELLO', label: 'Corte de cabello' },
  { value: 'AFEITADO', label: 'Afeitado' },
  { value: 'RECORTES_DE_BARBA', label: 'Recortes de barba' },
  { value: 'ARREGLO_DE_CABELLO', label: 'Arreglo de cabello' },
  { value: 'TRATAMIENTOS_CAPILARES', label: 'Tratamientos capilares' },
  { value: 'TRATAMIENTOS_FACIALES', label: 'Tratamientos faciales' },
];

const inputCls = 'w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-[6px] px-3 py-[9px] text-[#E8E4DC] text-[13px] outline-none box-border';
const labelCls = 'text-[11px] text-[#5A5A5A] tracking-[0.5px] uppercase block mb-[5px]';

export const ServiceModal = ({ editing, onClose, onSuccess }) => {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    name: '', description: '', price: '', pointsPrice: '',
    duration: '', category: 'CORTE_DE_CABELLO', status: 'activo',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      const rawPrice = typeof editing.price === 'string'
        ? editing.price.replace('Q', '') : editing.price;
      setForm({
        name: editing.name || '',
        description: editing.description || '',
        price: rawPrice || '',
        pointsPrice: editing.pointsPrice || '',
        duration: editing.duration || '',
        category: editing.category || 'CORTE_DE_CABELLO',
        status: editing.status || 'activo',
      });
    }
  }, [editing]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.price || !form.duration) {
      setError('Completa todos los campos requeridos'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        pointsPrice: form.pointsPrice ? Number(form.pointsPrice) : null,
      };
      if (isEdit) {
        await updateService(editing._id, payload);
        onSuccess('Servicio actualizado exitosamente');
      } else {
        await createService(payload);
        onSuccess('Servicio creado exitosamente');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el servicio');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111] border border-[#2A2A2A] rounded-xl w-full max-w-[480px] p-6 font-['Inter',sans-serif]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-['Bebas_Neue',sans-serif] text-[22px] tracking-[2px] text-[#E8E4DC] m-0">
            {isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <button onClick={onClose} className="bg-none border-none text-[#555] cursor-pointer text-lg p-[2px]">
            <i className="ti ti-x" />
          </button>
        </div>

        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-[6px] px-3 py-[10px] text-xs text-[#E88] mb-[14px] flex gap-2">
            <i className="ti ti-alert-circle" />{error}
          </div>
        )}

        <div className="flex flex-col gap-[14px]">
          <div>
            <label className={labelCls}>Nombre *</label>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Corte clásico" />
          </div>
          <div>
            <label className={labelCls}>Descripción *</label>
            <textarea className={`${inputCls} h-[72px] resize-y`}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Descripción del servicio..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Precio (Q) *</label>
              <input className={inputCls} type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Precio en puntos</label>
              <input className={inputCls} type="number" min="0" value={form.pointsPrice} onChange={e => set('pointsPrice', e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Duración *</label>
              <input className={inputCls} value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="30min" />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select className={`${inputCls} cursor-pointer`} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Categoría *</label>
            <select className={`${inputCls} cursor-pointer`} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-[10px] mt-6 justify-end">
          <button onClick={onClose} className="bg-transparent border border-[#2A2A2A] rounded-[6px] px-4 py-2 text-[#777] text-[13px] cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className={`rounded-[6px] px-5 py-2 text-[13px] font-medium cursor-pointer flex items-center gap-1.5 border-none transition-colors ${
              saving ? 'bg-[#A08030] text-[#0A0A0A] cursor-not-allowed' : 'bg-[#C9A84C] text-[#0A0A0A]'
            }`}>
            {saving && <div className="w-3 h-3 border-2 border-[#0A0A0A44] border-t-[#0A0A0A] rounded-full animate-spin" />}
            {saving ? 'Guardando…' : (isEdit ? 'Actualizar' : 'Crear servicio')}
          </button>
        </div>
      </div>
    </div>
  );
};
