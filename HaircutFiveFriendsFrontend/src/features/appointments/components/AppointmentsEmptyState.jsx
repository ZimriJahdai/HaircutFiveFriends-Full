export const AppointmentsEmptyState = ({ title, actionLabel, onAction, accent = '#C9A84C' }) => (
  <div className="flex flex-col items-center gap-3.5 py-16 text-[#5A5A5A] text-[14px] text-center">
    <i className="ti ti-calendar-off text-5xl text-[#333]" />
    <h3 className="m-0 text-[#E8E4DC] text-[16px] font-semibold">{title}</h3>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="flex items-center gap-1.5 bg-transparent border rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors mt-2"
        style={{ color: accent, borderColor: accent }}
      >
        <i className="ti ti-plus" />
        {actionLabel}
      </button>
    )}
  </div>
);
