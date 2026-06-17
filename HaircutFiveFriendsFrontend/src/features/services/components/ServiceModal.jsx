import { useState, useEffect } from 'react';
import { createService, updateService } from '../../../shared/api/service.js';

const CATEGORIES = [
  { value: 'CORTE_DE_CABELLO',       label: 'Corte de cabello' },
  { value: 'AFEITADO',               label: 'Afeitado' },
  { value: 'RECORTES_DE_BARBA',      label: 'Recortes de barba' },
  { value: 'ARREGLO_DE_CABELLO',     label: 'Arreglo de cabello' },
  { value: 'TRATAMIENTOS_CAPILARES', label: 'Tratamientos capilares' },
  { value: 'TRATAMIENTOS_FACIALES',  label: 'Tratamientos faciales' },
];

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '1rem',
};
const box = {
  background: '#111', border: '1px solid #2A2A2A', borderRadius: '12px',
  width: '100%', maxWidth: '480px', padding: '1.5rem', fontFamily: "'Inter',sans-serif",
};
const inp = {
  width: '100%', background: '#0F0F0F', border: '1px solid #2A2A2A',
  borderRadius: '6px', padding: '9px 12px', color: '#E8E4DC', fontSize: '13px',
  outline: 'none', boxSizing: 'border-box',
};
const lbl = {
  fontSize: '11px', color: '#5A5A5A', letterSpacing: '0.5px',
  textTransform: 'uppercase', display: 'block', marginBottom: '5px',
};
const row = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };

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
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: '22px', letterSpacing: '2px', color: '#E8E4DC' }}>
            {isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '18px', padding: '2px' }}>
            <i className="ti ti-x" />
          </button>
        </div>

        {error && (
          <div style={{ background: '#2A1515', border: '1px solid #5A2020', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#E88', marginBottom: '14px', display: 'flex', gap: '8px' }}>
            <i className="ti ti-alert-circle" />{error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Nombre *</label>
            <input style={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Corte clásico" />
          </div>
          <div>
            <label style={lbl}>Descripción *</label>
            <textarea style={{ ...inp, height: '72px', resize: 'vertical' }}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Descripción del servicio..." />
          </div>
          <div style={row}>
            <div>
              <label style={lbl}>Precio (Q) *</label>
              <input style={inp} type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label style={lbl}>Precio en puntos</label>
              <input style={inp} type="number" min="0" value={form.pointsPrice} onChange={e => set('pointsPrice', e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div style={row}>
            <div>
              <label style={lbl}>Duración *</label>
              <input style={inp} value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="30min" />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Categoría *</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '8px 16px', color: '#777', fontSize: '13px', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ background: saving ? '#A08030' : '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#0A0A0A', fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving && <div style={{ width: '12px', height: '12px', border: '2px solid #0A0A0A44', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
            {saving ? 'Guardando…' : (isEdit ? 'Actualizar' : 'Crear servicio')}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
