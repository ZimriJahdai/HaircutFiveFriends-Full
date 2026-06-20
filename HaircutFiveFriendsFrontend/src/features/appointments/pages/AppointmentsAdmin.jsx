import { useState, useEffect } from 'react';
import { useAppointments } from '../hooks/useAppointments.js';
import { useAppointmentStore } from '../store/useAppointmentStore.js';
import { AppointmentTable } from '../components/AppointmentTable.jsx';
import { AppointmentModal } from '../components/AppointmentModal.jsx';
import { AppointmentFilters } from '../components/AppointmentFilters.jsx';
import { AppointmentsEmptyState } from '../components/AppointmentsEmptyState.jsx';

export const AppointmentsAdmin = () => {
  const [dateFilter, setDateFilter] = useState('');
  const { appointments, loading, error: storeError, refetch } = useAppointments(dateFilter || null);
  const cancelAppointment = useAppointmentStore((s) => s.cancelAppointment);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState('Todas');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const openCreate = () => { setEditing(null); setShowModal(true); setLocalError(''); setSuccess(''); };
  const openEdit = (a) => { setEditing(a); setShowModal(true); setLocalError(''); setSuccess(''); };
  const closeModal = () => { setShowModal(false); setEditing(null); };
  const handleSuccess = (msg) => { setSuccess(msg); closeModal(); refetch(); };

  const handleCancel = async (a) => {
    if (!window.confirm(`¿Cancelar la cita de "${a.clienteId?.name || 'cliente'}"?`)) return;
    try {
      await cancelAppointment(a._id);
      setSuccess('Cita cancelada');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Error al cancelar la cita');
    }
  };

  const filtered = status === 'Todas' ? appointments : appointments.filter((a) => a.status === status);
  const displayError = localError || storeError;

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0 mb-1 leading-none">Citas</h1>
          <p className="text-[13px] text-[#5A5A5A] m-0">Gestiona las reservas de la barbería.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors">
          <i className="ti ti-plus text-[16px]" /> Nueva cita
        </button>
      </div>
      <div className="h-[1px] bg-[#C9A84C]/20 mb-4" />

      <AppointmentFilters
        status={status}
        onStatusChange={setStatus}
        date={dateFilter}
        onDateChange={setDateFilter}
        count={filtered.length}
      />

      {displayError && (
        <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] mb-4 flex items-center gap-2">
          <i className="ti ti-alert-circle text-lg" />{displayError}
        </div>
      )}
      {success && (
        <div className="bg-[#152A15] border border-[#205A20] rounded-lg px-3.5 py-2.5 text-[12px] text-[#8E8] mb-4 flex items-center gap-2">
          <i className="ti ti-check text-lg" />{success}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-[#5A5A5A] text-[13px]">Cargando citas…</div>
      ) : filtered.length === 0 ? (
        <AppointmentsEmptyState
          title={`No hay citas${status !== 'Todas' ? ` con estado "${status.toLowerCase()}"` : ''}${dateFilter ? ' para esta fecha' : ''}`}
          actionLabel="Crear cita"
          onAction={openCreate}
        />
      ) : (
        <AppointmentTable appointments={filtered} onEdit={openEdit} onCancel={handleCancel} />
      )}

      {showModal && <AppointmentModal editing={editing} onClose={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
};
