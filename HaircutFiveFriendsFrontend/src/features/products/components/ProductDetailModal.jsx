import { useState, useEffect } from 'react';
import { useCartStore } from '../../cart/store/cartStore.js';
import toast from 'react-hot-toast';

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

export const ProductDetailModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      id: product._id || product.id,
      type: 'PRODUCT',
      name: product.name,
      price: product.price,
      image: product.image || null,
      quantity,
    });
    toast.success(`${product.name} agregado al carrito`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#111111] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Image */}
        <div className="md:w-1/2 bg-[#0A0A0A] flex items-center justify-center min-h-[280px] md:min-h-[400px] relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-600">
              <i className="ti ti-package text-6xl" />
              <span className="text-sm uppercase tracking-wider">Sin imagen</span>
            </div>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-red-400 text-lg font-bold uppercase tracking-widest bg-black/80 px-6 py-3 rounded-xl border border-red-500/30">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="md:w-1/2 flex flex-col p-6 md:p-8 overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:relative md:top-0 md:right-0 self-end text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 mb-2"
          >
            <i className="ti ti-x text-2xl" />
          </button>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-800/60 px-3 py-1 rounded-full">
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
            {product.pointsPrice > 0 && (
              <span className="text-[11px] font-semibold text-[#00D2C4] uppercase tracking-wider bg-[#00D2C4]/10 px-3 py-1 rounded-full">
                Canjeable
              </span>
            )}
          </div>

          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl tracking-[2px] text-white leading-none mb-3">
            {product.name}
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="space-y-3 mb-6 bg-[#0A0A0A] rounded-xl p-4 border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Precio</span>
              <span className="text-lg font-bold text-white">{formatMoney(product.price)}</span>
            </div>
            {product.pointsPrice > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Precio en puntos</span>
                <span className="text-lg font-bold text-[#00D2C4]">{product.pointsPrice} pts</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Stock disponible</span>
              <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
              </span>
            </div>
          </div>

          {product.stock > 0 && (
            <>
              {/* Quantity selector */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-zinc-500">Cantidad</span>
                <div className="flex items-center gap-1 bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ti ti-minus text-sm" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ti ti-plus text-sm" />
                  </button>
                </div>
                <span className="text-xs text-zinc-600">
                  (máx. {product.stock})
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl bg-[#00D2C4] text-[#0A0A0A] text-sm font-bold hover:bg-[#00B4A8] transition-all shadow-[0_4px_16px_rgba(0,210,196,0.2)] hover:shadow-[0_6px_24px_rgba(0,210,196,0.35)] cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ti ti-shopping-cart text-base" />
                Agregar al carrito — {formatMoney(product.price * quantity)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
