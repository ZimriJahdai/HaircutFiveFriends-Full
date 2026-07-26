import { Badge } from '../../../shared/components';

const STATUS_TONE = {
  PENDIENTE: 'info',
  CANCELADA: 'danger',
  COMPLETADA: 'success',
};

const STATUS_LABEL = {
  PENDIENTE: 'Pendiente',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
};

export function AppointmentStatusBadge({ status }) {
  return <Badge label={STATUS_LABEL[status] || status} tone={STATUS_TONE[status] || 'neutral'} />;
}
