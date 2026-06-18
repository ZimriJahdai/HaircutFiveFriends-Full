import { useState, useMemo } from 'react';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { ProductCard } from '../components/ProductCard';
import { ProductEmptyState } from '../components/ProductEmptyState';
import { ProductPageHeader } from '../components/ProductPageHeader';

export const ProductsClient = () => {
  const { products, redeemableProducts, loading, error } = useProducts();
  const [tab, setTab] = useState('catalog');

  const stats = useMemo(() => ({
    catalog: products.length,
    redeemable: redeemableProducts.length,
  }), [products, redeemableProducts]);

  const activeList = tab === 'catalog' ? products : redeemableProducts;
  const emptyMessage = tab === 'catalog'
    ? 'Aún no hay productos activos disponibles para mostrar.'
    : 'No hay productos habilitados para canjear con puntos.';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <ProductPageHeader
          title="Productos"
          subtitle="Explora el catálogo y los productos que puedes canjear con tus puntos."
        />

        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">Catálogo activo</div>
            <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.catalog}</div>
          </div>
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">Canjeables</div>
            <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.redeemable}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setTab('catalog')}
            className={`rounded-xl px-5 py-2.5 text-[13px] font-medium border transition-colors focus:outline-none cursor-pointer ${tab === 'catalog' ? 'bg-[#00D2C4] border-[#00D2C4] text-[#0A0A0A] shadow-[0_0_12px_rgba(0,210,196,0.3)]' : 'bg-[#111] border-[#222] text-[#A5A5A5] hover:border-[#00D2C4] hover:text-[#00D2C4]'}`}
          >
            Catálogo
          </button>
          <button
            type="button"
            onClick={() => setTab('redeemable')}
            className={`rounded-xl px-5 py-2.5 text-[13px] font-medium border transition-colors focus:outline-none cursor-pointer ${tab === 'redeemable' ? 'bg-[#00D2C4] border-[#00D2C4] text-[#0A0A0A] shadow-[0_0_12px_rgba(0,210,196,0.3)]' : 'bg-[#111] border-[#222] text-[#A5A5A5] hover:border-[#00D2C4] hover:text-[#00D2C4]'}`}
          >
            Canjeables por puntos
          </button>
        </div>

        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] mb-4 flex items-center gap-2">
            <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-[13px]">
            <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#00D2C4] rounded-full animate-spin" />
            <span>Cargando productos…</span>
          </div>
        ) : activeList.length === 0 ? (
          <ProductEmptyState
            icon="ti-package-off"
            title={tab === 'catalog' ? 'Sin productos activos' : 'Sin productos canjeables'}
            subtitle={emptyMessage}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {activeList.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};