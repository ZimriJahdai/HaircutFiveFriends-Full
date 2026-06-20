// Estados de cita definidos en el backend (appointment.model.js -> enum)
export const APPOINTMENT_STATUS = {
  PENDIENTE: 'PENDIENTE',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
};

// Metadatos de presentación por estado (color/ícono/etiqueta)
export const STATUS_META = {
  PENDIENTE: { label: 'Pendiente', icon: 'ti-clock', bg: '#2A2415', border: '#5A4A20', text: '#E8C868' },
  COMPLETADA: { label: 'Completada', icon: 'ti-check', bg: '#152A15', border: '#205A20', text: '#8E8' },
  CANCELADA: { label: 'Cancelada', icon: 'ti-x', bg: '#2A1515', border: '#5A2020', text: '#E88' },
};

export const STATUS_FILTERS = ['Todas', 'PENDIENTE', 'COMPLETADA', 'CANCELADA'];

// Convierte el valor de un <input type="datetime-local"> a ISO para el backend
export const toBackendDate = (localValue) => {
  if (!localValue) return '';
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

// El modelo devuelve appointmentDate ya formateado ("YYYY-MM-DD HH:mm").
// Esta función lo deja legible para mostrarlo en la UI.
export const formatAppointmentDate = (value) => {
  if (!value) return '—';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Convierte appointmentDate del backend al formato que requiere datetime-local
export const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
