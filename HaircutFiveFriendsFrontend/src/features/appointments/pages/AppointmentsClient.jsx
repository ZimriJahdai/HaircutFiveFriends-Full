import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { useMyAppointments } from '../hooks/useMyAppointments.js';
import { useAppointmentStore } from '../store/useAppointmentStore.js';
import { AppointmentCard } from '../components/AppointmentCard.jsx';
import { AppointmentsEmptyState } from '../components/AppointmentsEmptyState.jsx';

export const AppointmentsClient = () => {
  const navigate = useNavigate();
  const { appointments, loading, error } = useMyAppointments();
  const cancelAppointment = useAppointmentStore((s) => s.cancelAppointment);

  const [cancelingId, setCancelingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleCancel = async (a) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return;
    setCancelingId(a._id);
    setActionError('');
    try {
      await cancelAppointment(a._id);
    } catch (err) {
      setActionError(err.response?.data?.message || 'No se pudo cancelar la cita');
    } finally {
      setCancelingId(null);
    }
  };

  const displayError = actionError || error;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="font-['Bebas_Neue',sans-serif] text-4xl md:text-5xl tracking-[3px] leading-none">
              MIS <span className="text-[#00D2C4]">CITAS</span>
            </h1>
            <p className="text-[#5A5A5A] text-[14px] mt-2">Revisa y gestiona tus reservas.</p>
          </div>
          <button
            onClick={() => navigate('/client/reservar')}
            className="flex items-center gap-2 bg-[#00D2C4] hover:bg-[#00B4A8] text-[#0A0A0A] font-semibold text-[13px] px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ti ti-calendar-plus" /> Reservar
          </button>
        </div>

        {displayError && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[13px] text-[#E88] mb-4 flex items-center gap-2">
            <i className="ti ti-alert-circle text-lg" />{displayError}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-[#5A5A5A] text-[13px]">Cargando tus citas…</div>
        ) : appointments.length === 0 ? (
          <AppointmentsEmptyState
            title="Aún no tienes citas reservadas"
            actionLabel="Reservar mi primera cita"
            onAction={() => navigate('/client/reservar')}
            accent="#00D2C4"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((a) => (
              <AppointmentCard
                key={a._id}
                appointment={a}
                onCancel={handleCancel}
                canceling={cancelingId === a._id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
