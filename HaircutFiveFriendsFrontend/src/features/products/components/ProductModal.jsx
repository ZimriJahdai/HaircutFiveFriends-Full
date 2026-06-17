import { useState } from 'react';
import { createProduct, updateProduct } from '../../../shared/api/product';

const CATEGORY_OPTIONS = [
  { value: 'SHAMPOO', label: 'Shampoo' },
  { value: 'WAX', label: 'Cera' },
  { value: 'GEL', label: 'Gel' },
  { value: 'BEARD_OIL', label: 'Aceite para barba' },
  { value: 'MACHINES', label: 'Máquinas' },
  { value: 'ACCESSORIES', label: 'Accesorios' },
];

const getInitialForm = (editing) => ({
  name: editing?.name || '',
  description: editing?.description || '',
  price: editing?.price ?? '',
  pointsPrice: editing?.pointsPrice ?? '',
  stock: editing?.stock ?? '',
  category: editing?.category || 'SHAMPOO',
  status: editing?.status || 'active',
  image: null,
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/avif'];

export const ProductModal = ({ editing, onClose, onSuccess }) => {
  const [form, setForm] = useState(() => getInitialForm(editing));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === 'image') {
      const file = files?.[0] || null;
      if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError('Formato de imagen no permitido');
        return;
      }
      if (file && file.size > MAX_IMAGE_SIZE) {
        setError('La imagen no puede superar 10 MB');
        return;
      }
      setError('');
      setForm((current) => ({ ...current, image: file }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('description', form.description);
      payload.append('price', form.price);
      payload.append('stock', form.stock);
      payload.append('category', form.category);
      payload.append('status', form.status);
      if (form.pointsPrice !== '') {
        payload.append('pointsPrice', form.pointsPrice);
      }
      if (form.image) payload.append('image', form.image);

      const productId = editing?._id || editing?.id;

      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload);
      }

      onSuccess(editing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2A2A2A]">
          <h2 className="text-[16px] font-semibold text-[#E8E4DC] m-0">
            {editing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button className="bg-transparent border-none text-[#5A5A5A] hover:text-[#E8E4DC] text-xl cursor-pointer p-0.5 leading-none transition-colors focus:outline-none" onClick={onClose} aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-name">Nombre</label>
                <input id="product-name" name="name" type="text" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors" placeholder="Nombre del producto" value={form.name} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-category">Categoría</label>
                <select id="product-category" name="category" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors" value={form.category} onChange={handleChange} required>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-description">Descripción</label>
              <textarea id="product-description" name="description" rows="4" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors resize-none" placeholder="Describe el producto" value={form.description} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-price">Precio</label>
                <input id="product-price" name="price" type="number" min="0" step="0.01" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors" placeholder="0.00" value={form.price} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-points">Precio en puntos</label>
                <input id="product-points" name="pointsPrice" type="number" min="0" step="1" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors" placeholder="Opcional" value={form.pointsPrice} onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-stock">Stock</label>
                <input id="product-stock" name="stock" type="number" min="0" step="1" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors" placeholder="0" value={form.stock} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-status">Estado</label>
                <select id="product-status" name="status" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-3 py-2 text-[13px] text-[#E8E4DC] outline-none transition-colors" value={form.status} onChange={handleChange} required>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#5A5A5A] font-medium" htmlFor="product-image">Imagen</label>
                <input id="product-image" name="image" type="file" accept="image/*" className="bg-[#111] border border-[#2A2A2A] focus:border-[#C9A84C] rounded-md px-2.5 py-1.5 text-[13px] text-[#E8E4DC] outline-none transition-colors file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-[12px] file:bg-[#2A2A2A] file:text-[#E8E4DC] hover:file:bg-[#333]" onChange={handleChange} />
              </div>
            </div>

            {editing?.image && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#5A5A5A] font-medium">Imagen actual</span>
                <div className="rounded-md overflow-hidden border border-[#2A2A2A] max-h-[160px]">
                  <img src={editing.image} alt={editing.name || 'producto'} className="w-full h-full object-cover block" />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
                <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[#2A2A2A]">
            <button type="button" className="bg-transparent hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] rounded-md px-4 py-2 text-[13px] cursor-pointer transition-colors focus:outline-none" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="bg-[#C9A84C] hover:bg-[#D4B45C] disabled:bg-[#5A4A2A] disabled:opacity-60 text-[#0A0A0A] border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none" disabled={submitting}>
              {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};