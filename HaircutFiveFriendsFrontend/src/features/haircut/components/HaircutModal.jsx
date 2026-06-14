import { useState, useEffect } from 'react';
import { useSaveHaircut } from '../hooks/useSaveHaircut';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  duration: '',
  faceTypeRecommended: 'CUALQUIERA',
  imageRef: null,
};

export const HaircutModal = ({ editing, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { saveHaircut } = useSaveHaircut();

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        description: editing.description || '',
        price: editing.price ?? '',
        duration: editing.duration ?? '',
        faceTypeRecommended: editing.faceTypeRecommended || 'CUALQUIERA',
        imageRef: null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageRef') {
      const file = files[0] || null;
      if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setLocalError('Formato de imagen no permitido (jpg, png, webp, avif)');
        setForm({ ...form, imageRef: null });
        return;
      }
      if (file && file.size > MAX_IMAGE_SIZE) {
        setLocalError('La imagen no puede superar 10 MB');
        setForm({ ...form, imageRef: null });
        return;
      }
      setLocalError('');
      setForm({ ...form, imageRef: file });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');

    try {
      await saveHaircut(form, editing ? editing._id : null);
      onSuccess(editing ? 'Corte actualizado exitosamente' : 'Corte creado exitosamente');
    } catch (err) {
      setLocalError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        err.message ||
        'Error al guardar el corte'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2A2A2A]">
          <h2 className="text-[16px] font-semibold text-[#E8E4DC] m-0">
            {editing ? 'Editar Corte' : 'Nuevo Corte'}
          </h2>
          <button className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer p-0.5 leading-none transition-colors focus:outline-none" onClick={onClose} aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="hc-name">Nombre del corte</label>
              <input
                id="hc-name"
                name="name"
                type="text"
                className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                placeholder="Ej: Classic Fade"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="hc-desc">Descripción</label>
              <textarea
                id="hc-desc"
                name="description"
                className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors resize-y min-h-[70px]"
                placeholder="Describe el corte…"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>

            {/* Face Type Recommended */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="hc-face">Tipo de Rostro Recomendado</label>
              <select
                id="hc-face"
                name="faceTypeRecommended"
                className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                value={form.faceTypeRecommended}
                onChange={handleChange}
                required
              >
                <option value="OVALADO">Ovalado</option>
                <option value="CUADRADO">Cuadrado</option>
                <option value="REDONDO">Redondo</option>
                <option value="CORAZÓN">Corazón</option>
                <option value="TRIANGULAR">Triangular</option>
                <option value="CUALQUIERA">Cualquiera</option>
              </select>
            </div>

            {/* Price + Duration row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="hc-price">Precio (Q)</label>
                <input
                  id="hc-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                  placeholder="75.00"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="hc-dur">Duración (min)</label>
                <input
                  id="hc-dur"
                  name="duration"
                  type="number"
                  min="1"
                  className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors"
                  placeholder="45"
                  value={form.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Image */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="hc-img">
                {editing ? 'Nueva imagen (opcional)' : 'Imagen del corte'}
              </label>
              <input
                id="hc-img"
                name="imageRef"
                type="file"
                accept="image/*"
                className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-2.5 py-1.5 text-[13px] text-[#E8E4DC] outline-none transition-colors file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-[12px] file:bg-[#2A2A2A] file:text-[#E8E4DC] hover:file:bg-[#333]"
                onChange={handleChange}
              />
            </div>

            {/* Current image preview (edit mode) */}
            {editing && editing.imageRef && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#5A5A5A] font-medium">Imagen actual</span>
                <div className="rounded-md overflow-hidden border border-[#2A2A2A] max-h-[120px]">
                  <img src={editing.imageRef} alt="current" className="w-full h-full object-cover block" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {localError && (
              <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
                <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                {localError}
              </div>
            )}
          </div>

          {/* Footer */}
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
              {submitting ? 'Guardando…' : editing ? 'Guardar Cambios' : 'Crear Corte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
