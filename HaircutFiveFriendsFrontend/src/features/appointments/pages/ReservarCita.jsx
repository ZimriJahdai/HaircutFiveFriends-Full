import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { useServices } from '../../services/hooks/useServices.js';
import { useAppointmentStore } from '../store/useAppointmentStore.js';
import { toBackendDate } from '../constants.js';

export const ReservarCita = () => {
  const navigate = useNavigate();
  const { services, loading: loadingServices } = useServices();
  const createAppointment = useAppointmentStore((s) => s.createAppointment);

  const [serviceId, setServiceId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedService = services.find((s) => s._id === serviceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId || !appointmentDate) {
      setError('Selecciona un servicio y una fecha');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // El barbero y el cliente se asignan automáticamente desde el token (USER_ROLE)
      await createAppointment({ serviceId, appointmentDate: toBackendDate(appointmentDate) });
      setSuccess('¡Cita reservada! Te asignamos un barbero disponible.');
      setTimeout(() => navigate('/client/citas'), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'No se pudo reservar la cita'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />
      <main className="flex-1 max-w-[640px] w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl md:text-5xl tracking-[3px] leading-none">
            RESERVAR <span className="text-[#00D2C4]">CITA</span>
          </h1>
          <p className="text-[#5A5A5A] text-[14px] mt-2">Elige tu servicio y horario. Te asignaremos un barbero disponible.</p>
        </div>

        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[13px] text-[#E88] mb-4 flex items-center gap-2">
            <i className="ti ti-alert-circle text-lg" />{error}
          </div>
        )}
        {success && (
          <div className="bg-[#152A15] border border-[#205A20] rounded-lg px-3.5 py-2.5 text-[13px] text-[#8E8] mb-4 flex items-center gap-2">
            <i className="ti ti-check text-lg" />{success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="block text-[12px] text-[#9E9E9E] uppercase tracking-wide mb-2">Servicio</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={loadingServices}
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3.5 py-3 text-[14px] text-[#E8E4DC] outline-none focus:border-[#00D2C4] cursor-pointer"
            >
              <option value="">{loadingServices ? 'Cargando servicios…' : 'Selecciona un servicio'}</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>{s.name} {s.price ? `· ${s.price}` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] text-[#9E9E9E] uppercase tracking-wide mb-2">Fecha y hora</label>
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3.5 py-3 text-[14px] text-[#E8E4DC] outline-none focus:border-[#00D2C4] cursor-pointer"
            />
          </div>

          {selectedService && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-[#9E9E9E] border-t border-white/[0.06] pt-4">
              {selectedService.duration && <span><i className="ti ti-clock text-[#00D2C4] mr-1" />{selectedService.duration}</span>}
              {selectedService.price != null && <span><i className="ti ti-cash text-[#00D2C4] mr-1" />{selectedService.price}</span>}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#00D2C4] hover:bg-[#00B4A8] text-[#0A0A0A] font-semibold text-[14px] px-6 py-3.5 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {saving ? 'Reservando…' : 'Confirmar reserva'}
            {!saving && <i className="ti ti-calendar-check text-[16px]" />}
          </button>
        </form>
      </main>
    </div>
  );
};
