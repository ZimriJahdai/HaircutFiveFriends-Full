import { useState, useEffect } from 'react';
import { useSaveBarber } from '../hooks/useSaveBarber';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DEFAULT_SCHEDULE = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = { active: false, start: '09:00', end: '17:00' };
  return acc;
}, {});

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  status: true,
  profilePicture: null,
  schedule: { ...DEFAULT_SCHEDULE },
};

function parseScheduleFromBarber(barber) {
  if (!barber.schedule || !Array.isArray(barber.schedule)) return { ...DEFAULT_SCHEDULE };
  const schedule = { ...DEFAULT_SCHEDULE };
  barber.schedule.forEach(({ days, hours }) => {
    if (days && schedule[days]) {
      schedule[days].active = true;
      const [start, end] = hours.split(' - ').map(s => s.trim());
      if (start) schedule[days].start = start;
      if (end) schedule[days].end = end;
    }
  });
  return schedule;
}

export const BarberModal = ({ editing, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { saveBarber } = useSaveBarber();

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        email: editing.email || '',
        password: '',
        phone: editing.phone || '',
        status: editing.status ?? true,
        profilePicture: null,
        schedule: parseScheduleFromBarber(editing),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'profilePicture') {
      const file = files[0] || null;
      if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setLocalError('Formato de imagen no permitido (jpg, png, webp, avif)');
        setForm({ ...form, profilePicture: null });
        return;
      }
      if (file && file.size > MAX_IMAGE_SIZE) {
        setLocalError('La imagen no puede superar 10 MB');
        setForm({ ...form, profilePicture: null });
        return;
      }
      setLocalError('');
      setForm({ ...form, profilePicture: file });
      return;
    }

    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleScheduleChange = (day, field, value) => {
    setForm({
      ...form,
      schedule: {
        ...form.schedule,
        [day]: { ...form.schedule[day], [field]: value },
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const invalidDays = Object.entries(form.schedule)
      .filter(([, s]) => s.active && s.start >= s.end)
      .map(([day]) => day);
    if (invalidDays.length > 0) {
      setLocalError(`La hora de entrada debe ser antes de la salida en: ${invalidDays.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      await saveBarber(form, editing ? editing._id : null);
      onSuccess(editing ? 'Barbero actualizado exitosamente' : 'Barbero creado exitosamente');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length > 0) {
        setLocalError(data.errors.map((e) => `• ${e.msg}`).join('\n'));
      } else {
        setLocalError(data?.message || err.message || 'Error al guardar el barbero');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2A2A2A]">
          <h2 className="text-[16px] font-semibold text-[#E8E4DC] m-0">
            {editing ? 'Editar Barbero' : 'Nuevo Barbero'}
          </h2>
          <button className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer p-0.5 leading-none transition-colors focus:outline-none" onClick={onClose} aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="bc-name">Nombre</label>
                <input
                  id="bc-name"
                  name="name"
                  type="text"
                  className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                  placeholder="Nombre del barbero"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="bc-email">Correo electrónico</label>
                <input
                  id="bc-email"
                  name="email"
                  type="email"
                  className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                  placeholder="correo@dominio.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="bc-phone">Teléfono (8 dígitos)</label>
                <input
                  id="bc-phone"
                  name="phone"
                  type="tel"
                  className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                  placeholder="12345678"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={8}
                  onKeyDown={(e) => {
                    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
                  }}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="bc-password">Contraseña</label>
                <input
                  id="bc-password"
                  name="password"
                  type="password"
                  className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                  placeholder={editing ? 'Dejar en blanco para mantener' : 'Nueva contraseña'}
                  value={form.password}
                  onChange={handleChange}
                  {...(!editing ? { required: true } : {})}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="bc-status"
                name="status"
                type="checkbox"
                checked={form.status}
                onChange={handleChange}
                className="h-4 w-4 rounded border-[#2A2A2A] bg-[#111] text-[#C9A84C] focus:ring-[#C9A84C]"
              />
              <label htmlFor="bc-status" className="text-[13px] text-[#E8E4DC]">Barbero activo</label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="bc-photo">Foto de perfil</label>
              <input
                id="bc-photo"
                name="profilePicture"
                type="file"
                accept="image/*"
                className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-2.5 py-1.5 text-[13px] text-[#E8E4DC] outline-none transition-colors file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-[12px] file:bg-[#2A2A2A] file:text-[#E8E4DC] hover:file:bg-[#333]"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] text-[#5A5A5A] font-medium">Horario semanal</span>
              <div className="border border-[#2A2A2A] rounded-lg overflow-hidden divide-y divide-[#2A2A2A]">
                {DAYS_OF_WEEK.map((day) => {
                  const s = form.schedule[day];
                  const hasError = s.active && s.start >= s.end;
                  return (
                    <div key={day} className={`flex flex-col px-3 py-2 bg-[#111] transition-colors ${hasError ? 'bg-[#1A1010]' : 'hover:bg-[#161616]'}`}>
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={s.active}
                          onChange={(e) => handleScheduleChange(day, 'active', e.target.checked)}
                          className="h-4 w-4 rounded border-[#2A2A2A] bg-[#111] text-[#C9A84C] focus:ring-[#C9A84C] shrink-0"
                        />
                        <span className="text-[13px] text-[#E8E4DC] min-w-[68px] font-medium">{day}</span>
                        {s.active ? (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <input
                              type="time"
                              value={s.start}
                              onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                              className={`bg-[#0D0D0D] border rounded-md px-2 py-1 text-[12px] text-[#E8E4DC] outline-none w-[95px] cursor-default ${hasError ? 'border-[#C94C4C]' : 'border-[#2A2A2A]'}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-[#5A5A5A] text-[12px]">a</span>
                            <input
                              type="time"
                              value={s.end}
                              onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                              className={`bg-[#0D0D0D] border rounded-md px-2 py-1 text-[12px] text-[#E8E4DC] outline-none w-[95px] cursor-default ${hasError ? 'border-[#C94C4C]' : 'border-[#2A2A2A]'}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <span className="ml-auto text-[11px] text-[#5A5A5A]">Descanso</span>
                        )}
                      </label>
                      {hasError && (
                        <span className="text-[11px] text-[#C94C4C] mt-1 ml-9">Entrada debe ser antes de salida</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {editing && editing.profilePicture && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#5A5A5A] font-medium">Foto actual</span>
                <div className="rounded-md overflow-hidden border border-[#2A2A2A] max-h-[140px]">
                  <img src={editing.profilePicture} alt="current" className="w-full h-full object-cover block" />
                </div>
              </div>
            )}

            {localError && (
              <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
                <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                {localError}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[#2A2A2A]">
            <button
              type="button"
              className="bg-transparent hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-md px-4 py-2 text-[13px] cursor-pointer transition-colors focus:outline-none"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#C9A84C] hover:bg-[#D4B45C] disabled:bg-[#5A4A2A] disabled:opacity-60 text-[#0A0A0A] border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
              disabled={submitting}
            >
              {submitting ? 'Guardando…' : editing ? 'Guardar Cambios' : 'Crear Barbero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
