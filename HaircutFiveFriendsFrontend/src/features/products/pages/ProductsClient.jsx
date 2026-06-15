import { useEffect, useMemo, useState } from 'react';
import { getProducts, getRedeemableProducts } from '../../../shared/api/product';
import { ProductCard } from '../components/ProductCard';
import { ProductEmptyState } from '../components/ProductEmptyState';
import { ProductPageHeader } from '../components/ProductPageHeader';

export const ProductsClient = () => {
  const [products, setProducts] = useState([]);
  const [redeemableProducts, setRedeemableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('catalog');

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const [allResponse, redeemableResponse] = await Promise.all([
          getProducts(),
          getRedeemableProducts(),
        ]);

        if (!ignore) {
          const allProducts = allResponse.data?.data || [];
          setProducts(allProducts.filter((product) => product.status === 'active'));
          setRedeemableProducts(redeemableResponse.data?.data || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Error al cargar productos');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => ({
    catalog: products.length,
    redeemable: redeemableProducts.length,
  }), [products, redeemableProducts]);

  const activeList = tab === 'catalog' ? products : redeemableProducts;
  const emptyMessage = tab === 'catalog'
    ? 'Aún no hay productos activos disponibles para mostrar.'
    : 'No hay productos habilitados para canjear con puntos.';

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#E8E4DC] w-full px-6 py-6 md:px-8 md:py-8">
      <div className="max-w-[1400px] mx-auto">
        <ProductPageHeader
          title="Productos"
          subtitle="Explora el catálogo y los productos que puedes canjear con tus puntos."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">Catálogo activo</div>
            <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.catalog}</div>
          </div>
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">Canjeables</div>
            <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.redeemable}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('catalog')}
            className={`rounded-full px-4 py-2 text-[13px] border transition-colors ${tab === 'catalog' ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]' : 'bg-transparent border-[#2A2A2A] text-[#A5A5A5] hover:border-[#C9A84C] hover:text-[#E8E4DC]'}`}
          >
            Catálogo
          </button>
          <button
            type="button"
            onClick={() => setTab('redeemable')}
            className={`rounded-full px-4 py-2 text-[13px] border transition-colors ${tab === 'redeemable' ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]' : 'bg-transparent border-[#2A2A2A] text-[#A5A5A5] hover:border-[#C9A84C] hover:text-[#E8E4DC]'}`}
          >
            Canjeables por puntos
          </button>
        </div>

        <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] mb-4 flex items-center gap-2">
            <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-[13px]">
            <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
            <span>Cargando productos…</span>
          </div>
        ) : activeList.length === 0 ? (
          <ProductEmptyState
            icon="ti-package-off"
            title={tab === 'catalog' ? 'Sin productos activos' : 'Sin productos canjeables'}
            subtitle={emptyMessage}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeList.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};