import { AppointmentStatusBadge } from './AppointmentStatusBadge.jsx';
import { formatAppointmentDate, APPOINTMENT_STATUS } from '../constants.js';

const HEADERS = ['Fecha y hora', 'Cliente', 'Barbero', 'Servicio', 'Precio', 'Estado', 'Acciones'];

export const AppointmentTable = ({ appointments, onEdit, onCancel }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="border-b border-[#1E1E1E]">
          {HEADERS.map((h) => (
            <th key={h} className="px-3 py-2.5 text-left text-[#5A5A5A] text-[10px] tracking-[1px] uppercase font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {appointments.map((a) => {
          const canceled = a.status === APPOINTMENT_STATUS.CANCELADA;
          return (
            <tr key={a._id} className="border-b border-[#151515] hover:bg-[#1A1A1A] transition-colors">
              <td className="px-3 py-3 text-[#E8E4DC] font-medium whitespace-nowrap">
                {formatAppointmentDate(a.appointmentDate)}
              </td>
              <td className="px-3 py-3 text-[#E8E4DC]">{a.clienteId?.name || '—'}</td>
              <td className="px-3 py-3 text-[#AAA]">{a.barberId?.name || 'Sin asignar'}</td>
              <td className="px-3 py-3 text-[#AAA]">{a.serviceId?.name || '—'}</td>
              <td className="px-3 py-3 text-[#5A5A5A]">{a.serviceId?.price ?? '—'}</td>
              <td className="px-3 py-3"><AppointmentStatusBadge status={a.status} /></td>
              <td className="px-3 py-3">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(a)}
                    className="flex items-center px-2.5 py-1.5 bg-transparent border border-[#2A2A2A] text-[#AAA] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 rounded text-[12px] cursor-pointer transition-colors"
                    title="Editar cita"
                  >
                    <i className="ti ti-edit text-[14px]" />
                  </button>
                  <button
                    onClick={() => onCancel(a)}
                    disabled={canceled}
                    className="flex items-center px-2.5 py-1.5 bg-transparent border border-[#2A2A2A] rounded text-[12px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed enabled:cursor-pointer enabled:text-[#AAA] enabled:hover:text-[#E88] enabled:hover:border-[#5A2020]"
                    title={canceled ? 'Cita ya cancelada' : 'Cancelar cita'}
                  >
                    <i className="ti ti-ban text-[14px]" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
