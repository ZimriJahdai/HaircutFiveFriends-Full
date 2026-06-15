const CATEGORY_LABELS = {
  SHAMPOO: 'Shampoo',
  WAX: 'Cera',
  GEL: 'Gel',
  BEARD_OIL: 'Aceite para barba',
  MACHINES: 'Máquinas',
  ACCESSORIES: 'Accesorios',
};

const formatMoney = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 2,
  }).format(numeric);
};

export const ProductCard = ({ product, mode = 'client', onEdit, onDelete }) => {
  const isInactive = product.status === 'inactive';
  const canEdit = mode === 'admin' && (onEdit || onDelete);

  return (
    <div className="relative rounded-2xl border border-[#2A2A2A] bg-[#111] overflow-hidden shadow-[0_0_0_1px_rgba(201,168,76,0.08)] transition-transform hover:-translate-y-0.5">
      <div className="relative h-48 bg-[#181818] overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#5A5A5A] text-[12px] uppercase tracking-[1px]">
            Sin imagen
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {product.pointsPrice > 0 && (
            <span className="rounded-full bg-[#C9A84C] px-2.5 py-1 text-[10px] font-semibold text-[#0A0A0A] uppercase tracking-[1px]">
              Canjeable
            </span>
          )}
          {isInactive && (
            <span className="rounded-full bg-[#301E1E] px-2.5 py-1 text-[10px] font-semibold text-[#E88] uppercase tracking-[1px]">
              Inactivo
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-[#E8E4DC] leading-tight">{product.name}</h3>
            <p className="text-[12px] text-[#8E8E8E] mt-1">{CATEGORY_LABELS[product.category] || product.category}</p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              className="text-[#8E8E8E] hover:text-[#E8E4DC] focus:outline-none"
              aria-label="Editar producto"
            >
              <i className="ti ti-pencil" aria-hidden="true" />
            </button>
          )}
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-[#A5A5A5] line-clamp-3">{product.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[12px] text-[#5A5A5A]">
            <span>Precio</span>
            <span className="text-[#E8E4DC]">{formatMoney(product.price)}</span>
          </div>
          {product.pointsPrice > 0 && (
            <div className="flex items-center justify-between text-[12px] text-[#5A5A5A]">
              <span>Puntos</span>
              <span className="text-[#E8E4DC]">{Number(product.pointsPrice)} pts</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[12px] text-[#5A5A5A]">
            <span>Stock</span>
            <span className="text-[#E8E4DC]">{Number(product.stock ?? 0)}</span>
          </div>
          {mode === 'admin' && (
            <div className="flex items-center justify-between text-[12px] text-[#5A5A5A]">
              <span>Estado</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isInactive ? 'bg-[#301E1E] text-[#E88]' : 'bg-[#1E3E1E] text-[#8E8]'}`}>
                {isInactive ? 'Inactivo' : 'Activo'}
              </span>
            </div>
          )}
        </div>

        {canEdit && onDelete && (
          <div className="mt-4 pt-3 border-t border-[#222] flex justify-end">
            <button
              type="button"
              className="text-[12px] text-[#E88] hover:text-[#ffb1b1]"
              onClick={() => onDelete(product)}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};