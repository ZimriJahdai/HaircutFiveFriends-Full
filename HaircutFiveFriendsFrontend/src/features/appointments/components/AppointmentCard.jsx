import { AppointmentStatusBadge } from './AppointmentStatusBadge.jsx';
import { formatAppointmentDate, APPOINTMENT_STATUS } from '../constants.js';

// Tarjeta de cita para la vista del cliente ("Mis citas").
export const AppointmentCard = ({ appointment, onCancel, canceling }) => {
  const a = appointment;
  const canCancel = a.status === APPOINTMENT_STATUS.PENDIENTE;

  return (
    <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#00D2C4]/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#00D2C4]/10 border border-[#00D2C4]/20 rounded-xl p-3 text-[#00D2C4]">
            <i className="ti ti-calendar-event text-xl" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#E8E4DC]">{a.serviceId?.name || 'Servicio'}</h3>
            <p className="text-[12px] text-[#5A5A5A] mt-0.5">{formatAppointmentDate(a.appointmentDate)}</p>
          </div>
        </div>
        <AppointmentStatusBadge status={a.status} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#9E9E9E] border-t border-white/[0.06] pt-3">
        <span className="flex items-center gap-1.5">
          <i className="ti ti-user text-[#00D2C4]" /> {a.barberId?.name || 'Barbero por asignar'}
        </span>
        {a.serviceId?.duration && (
          <span className="flex items-center gap-1.5">
            <i className="ti ti-clock text-[#00D2C4]" /> {a.serviceId.duration}
          </span>
        )}
        {a.serviceId?.price != null && (
          <span className="flex items-center gap-1.5">
            <i className="ti ti-cash text-[#00D2C4]" /> {a.serviceId.price}
          </span>
        )}
      </div>

      {canCancel && (
        <div className="flex justify-end">
          <button
            onClick={() => onCancel(a)}
            disabled={canceling}
            className="flex items-center gap-1.5 bg-transparent border border-[#5A2020] text-[#E88] hover:bg-[#2A1515] rounded-lg px-3.5 py-2 text-[12px] font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ti ti-ban" /> {canceling ? 'Cancelando…' : 'Cancelar cita'}
          </button>
        </div>
      )}
    </div>
  );
};
