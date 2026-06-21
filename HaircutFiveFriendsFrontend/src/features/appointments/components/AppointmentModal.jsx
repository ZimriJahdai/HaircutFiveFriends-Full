import { useState } from 'react';
import { useAppointmentStore } from '../store/useAppointmentStore.js';
import { useAppointmentResources } from '../hooks/useAppointmentResources.js';
import { APPOINTMENT_STATUS, toBackendDate, toDateTimeLocal } from '../constants.js';

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

// Construye el estado inicial del formulario a partir de la cita en edición (o vacío al crear)
const buildInitialForm = (editing) => ({
  clienteId: editing?.clienteId?._id || editing?.clienteId || '',
  barberId: editing?.barberId?._id || editing?.barberId || '',
  serviceId: editing?.serviceId?._id || editing?.serviceId || '',
  appointmentDate: editing ? toDateTimeLocal(editing.appointmentDate) : '',
  status: editing?.status || APPOINTMENT_STATUS.PENDIENTE,
});

export const AppointmentModal = ({ editing, onClose, onSuccess }) => {
  const isEdit = !!editing;
  const { services, barbers, clients, loading: loadingRes, error: resError } = useAppointmentResources({ withClients: true });
  const createAppointment = useAppointmentStore((s) => s.createAppointment);
  const updateAppointment = useAppointmentStore((s) => s.updateAppointment);

  const [form, setForm] = useState(() => buildInitialForm(editing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.clienteId || !form.serviceId || !form.barberId || !form.appointmentDate) {
      setError('Cliente, barbero, servicio y fecha son obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        clienteId: form.clienteId,
        barberId: form.barberId,
        serviceId: form.serviceId,
        appointmentDate: toBackendDate(form.appointmentDate),
        status: form.status,
      };
      if (isEdit) {
        await updateAppointment(editing._id, payload);
        onSuccess('Cita actualizada exitosamente');
      } else {
        await createAppointment(payload);
        onSuccess('Cita creada exitosamente');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Error al guardar la cita'
      );
    } finally {
      setSaving(false);
    }
  };

  const displayError = error || resError;

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: '22px', letterSpacing: '2px', color: '#E8E4DC' }}>
            {isEdit ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '18px', padding: '2px' }}>
            <i className="ti ti-x" />
          </button>
        </div>

        {displayError && (
          <div style={{ background: '#2A1515', border: '1px solid #5A2020', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#E88', marginBottom: '14px', display: 'flex', gap: '8px' }}>
            <i className="ti ti-alert-circle" />{displayError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Cliente *</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.clienteId} onChange={(e) => set('clienteId', e.target.value)} disabled={loadingRes}>
              <option value="">{loadingRes ? 'Cargando…' : 'Selecciona un cliente'}</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Barbero *</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.barberId} onChange={(e) => set('barberId', e.target.value)} disabled={loadingRes}>
              <option value="">{loadingRes ? 'Cargando…' : 'Selecciona un barbero'}</option>
              {barbers.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Servicio *</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)} disabled={loadingRes}>
              <option value="">{loadingRes ? 'Cargando…' : 'Selecciona un servicio'}</option>
              {services.map((s) => <option key={s._id} value={s._id}>{s.name} {s.duration ? `· ${s.duration}` : ''}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Fecha y hora *</label>
            <input style={inp} type="datetime-local" value={form.appointmentDate} onChange={(e) => set('appointmentDate', e.target.value)} />
          </div>

          {isEdit && (
            <div>
              <label style={lbl}>Estado</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value={APPOINTMENT_STATUS.PENDIENTE}>Pendiente</option>
                <option value={APPOINTMENT_STATUS.COMPLETADA}>Completada</option>
                <option value={APPOINTMENT_STATUS.CANCELADA}>Cancelada</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '8px 16px', color: '#777', fontSize: '13px', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving || loadingRes}
            style={{ background: saving || loadingRes ? '#A08030' : '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#0A0A0A', fontSize: '13px', fontWeight: 500, cursor: saving || loadingRes ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving && <div style={{ width: '12px', height: '12px', border: '2px solid #0A0A0A44', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
            {saving ? 'Guardando…' : (isEdit ? 'Actualizar' : 'Crear cita')}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
