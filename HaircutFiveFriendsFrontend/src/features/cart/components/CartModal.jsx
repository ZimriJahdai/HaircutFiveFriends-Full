import { useEffect, useRef } from 'react';
import { useCartStore } from '../store/cartStore.js';

export const CartModal = ({ onClose }) => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const overlayRef = useRef(null);

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

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex justify-end bg-black/60"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#111111] border-l border-white/[0.06] shadow-2xl h-screen flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <i className="ti ti-shopping-cart text-[#00D2C4] text-base" />
            Carrito
            {items.length > 0 && (
              <span className="text-[11px] text-zinc-500 font-normal normal-case">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <i className="ti ti-shopping-cart-off text-5xl mb-4 opacity-30" />
              <p className="text-sm font-medium">Tu carrito está vacío</p>
              <p className="text-xs mt-1">Agrega productos o servicios para continuar</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-4 bg-[#0A0A0A] rounded-xl p-3 border border-white/[0.04]"
              >
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <i className={`ti ${item.type === 'SERVICE' ? 'ti-scissors' : 'ti-package'} text-zinc-500 text-lg`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-zinc-500">Q{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ti ti-minus text-xs" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ti ti-plus text-xs" />
                  </button>
                </div>

                <div className="text-right min-w-[60px]">
                  <p className="text-sm font-semibold text-white">
                    Q{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id, item.type)}
                  className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer p-1"
                >
                  <i className="ti ti-trash text-sm" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/[0.06] px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="text-lg font-bold text-white">
                Q{getTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-all cursor-pointer"
              >
                Vaciar carrito
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#00D2C4] text-[#0A0A0A] text-sm font-bold hover:bg-[#00B4A8] transition-all shadow-[0_4px_16px_rgba(0,210,196,0.2)] cursor-pointer"
              >
                Ir a pagar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
