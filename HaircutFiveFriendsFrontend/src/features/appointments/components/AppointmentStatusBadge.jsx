import { STATUS_META } from '../constants.js';

export const AppointmentStatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.PENDIENTE;
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
      style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.text }}
    >
      <i className={`ti ${meta.icon} text-[13px]`} aria-hidden="true" />
      {meta.label}
    </span>
  );
};
