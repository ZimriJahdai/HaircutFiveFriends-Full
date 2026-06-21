import { STATUS_FILTERS, STATUS_META } from '../constants.js';

const labelFor = (f) => (f === 'Todas' ? 'Todas' : STATUS_META[f]?.label || f);

// Filtros por estado + filtro opcional por fecha (vista admin).
export const AppointmentFilters = ({ status, onStatusChange, date, onDateChange, count }) => (
  <div className="flex gap-2 mb-5 flex-wrap items-center">
    {STATUS_FILTERS.map((f) => {
      const active = status === f;
      return (
        <button
          key={f}
          onClick={() => onStatusChange(f)}
          className="px-3 py-1.5 rounded-md text-[12px] border transition-colors cursor-pointer"
          style={{
            background: active ? '#C9A84C18' : 'transparent',
            border: `1px solid ${active ? '#C9A84C44' : '#2A2A2A'}`,
            color: active ? '#C9A84C' : '#555',
          }}
        >
          {labelFor(f)}
        </button>
      );
    })}

    <div className="flex items-center gap-2 ml-2">
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-md px-2.5 py-1.5 text-[12px] text-[#E8E4DC] outline-none cursor-pointer"
      />
      {date && (
        <button
          onClick={() => onDateChange('')}
          className="text-[12px] text-[#555] hover:text-[#C9A84C] cursor-pointer"
          title="Quitar filtro de fecha"
        >
          <i className="ti ti-x" />
        </button>
      )}
    </div>

    <span className="ml-auto text-[12px] text-[#555] self-center">
      {count} cita{count !== 1 ? 's' : ''}
    </span>
  </div>
);
