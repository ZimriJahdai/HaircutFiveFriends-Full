import { useState, useEffect } from 'react';
import { useSaveClient } from '../hooks/useSaveClient';

/* ─── Constants ─────────────────────────────────────────────────── */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '',
  faceshape: '', status: true, profilePicture: null,
};

const INPUT_CLS = 'bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors';
const LABEL_CLS = 'text-[12px] text-[#5A5A5A] font-medium';

/* ─── Local sub-components ──────────────────────────────────────── */
const FormField = ({ id, label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className={LABEL_CLS} htmlFor={id}>{label}</label>
    {children}
  </div>
);

const ModalHeader = ({ editing, onClose }) => (
  <div className="flex justify-between items-center px-5 py-4 border-b border-[#2A2A2A]">
    <h2 className="text-[16px] font-semibold text-[#E8E4DC] m-0">
      {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
    </h2>
    <button
      type="button"
      onClick={onClose}
      aria-label="Cerrar"
      className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer p-0.5 leading-none transition-colors focus:outline-none"
    >
      <i className="ti ti-x" aria-hidden="true" />
    </button>
  </div>
);

const ModalFooter = ({ editing, submitting, onClose }) => (
  <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[#2A2A2A]">
    <button
      type="button"
      onClick={onClose}
      className="bg-transparent hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-md px-4 py-2 text-[13px] cursor-pointer transition-colors focus:outline-none"
    >
      Cancelar
    </button>
    <button
      type="submit"
      disabled={submitting}
      className="bg-[#C9A84C] hover:bg-[#D4B45C] disabled:bg-[#5A4A2A] disabled:opacity-60 text-[#0A0A0A] border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
    >
      {submitting ? 'Guardando…' : editing ? 'Guardar Cambios' : 'Crear Cliente'}
    </button>
  </div>
);

/* ─── Main component ────────────────────────────────────────────── */
export const ClientModal = ({ editing, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const { saveClient } = useSaveClient();

  useEffect(() => {
    setForm(editing
      ? { name: editing.name || '', email: editing.email || '', password: '',
          phone: editing.phone || '', faceshape: editing.faceshape || '',
          status: editing.status ?? true, profilePicture: null }
      : EMPTY_FORM
    );
  }, [editing]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'profilePicture') {
      const file = files[0] || null;
      if (file && !ALLOWED_IMAGE_TYPES.includes(file.type))
        return (setLocalError('Formato no permitido (jpg, png, webp, avif)'), setForm({ ...form, profilePicture: null }));
      if (file && file.size > MAX_IMAGE_SIZE)
        return (setLocalError('La imagen no puede superar 10 MB'), setForm({ ...form, profilePicture: null }));
      setLocalError('');
      return setForm({ ...form, profilePicture: file });
    }

    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');
    try {
      await saveClient(form, editing?._id ?? null);
      onSuccess(editing ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length > 0) {
        setLocalError(data.errors.map((e) => `• ${e.msg}`).join('\n'));
      } else {
        setLocalError(data?.message || err.message || 'Error al guardar el cliente');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <ModalHeader editing={editing} onClose={onClose} />

        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField id="cc-name" label="Nombre">
                <input id="cc-name" name="name" type="text" className={INPUT_CLS} placeholder="Nombre completo" value={form.name} onChange={handleChange} required />
              </FormField>
              <FormField id="cc-email" label="Correo electrónico">
                <input id="cc-email" name="email" type="email" className={INPUT_CLS} placeholder="correo@dominio.com" value={form.email} onChange={handleChange} required />
              </FormField>
            </div>

            {!editing && (
              <FormField id="cc-password" label="Contraseña">
                <input id="cc-password" name="password" type="password" className={INPUT_CLS} placeholder="Nueva contraseña" value={form.password} onChange={handleChange} required />
              </FormField>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField id="cc-phone" label="Teléfono (8 dígitos)">
                <input
                  id="cc-phone"
                  name="phone"
                  type="tel"
                  className={INPUT_CLS}
                  placeholder="12345678"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={8}
                  onKeyDown={(e) => {
                    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
                  }}
                  required
                />
              </FormField>
              <FormField id="cc-faceshape" label="Forma de rostro">
                <input id="cc-faceshape" name="faceshape" type="text" className={INPUT_CLS} placeholder="Ovalado, cuadrado, redondo..." value={form.faceshape} onChange={handleChange} />
              </FormField>
            </div>

            <div className="flex items-center gap-2">
              <input id="cc-status" name="status" type="checkbox" checked={form.status} onChange={handleChange} className="h-4 w-4 rounded border-[#2A2A2A] bg-[#111] text-[#C9A84C] focus:ring-[#C9A84C]" />
              <label htmlFor="cc-status" className="text-[13px] text-[#E8E4DC]">Cliente activo</label>
            </div>

            <FormField id="cc-photo" label="Foto de perfil">
              <input id="cc-photo" name="profilePicture" type="file" accept="image/*" onChange={handleChange}
                className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-2.5 py-1.5 text-[13px] text-[#E8E4DC] outline-none transition-colors file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-[12px] file:bg-[#2A2A2A] file:text-[#E8E4DC] hover:file:bg-[#333]"
              />
            </FormField>

            {editing?.profilePicture && (
              <div className="flex flex-col gap-1.5">
                <span className={LABEL_CLS}>Foto actual</span>
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

          <ModalFooter editing={editing} submitting={submitting} onClose={onClose} />
        </form>
      </div>
    </div>
  );
};
