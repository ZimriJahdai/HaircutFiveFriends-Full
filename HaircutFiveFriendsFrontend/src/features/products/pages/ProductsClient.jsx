import { useState, useMemo, useEffect, useCallback } from 'react';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { ProductEmptyState } from '../components/ProductEmptyState';
import { ProductPageHeader } from '../components/ProductPageHeader';
import { useAuthStore } from '../../auth/store/authStore';
import { fetchClientPoints } from '../../../shared/api/dashboardService';
import { axiosAdmin } from '../../../shared/api/api';
import { ConfirmModal } from '../../favorites/components/ConfirmModal.jsx';

export const ProductsClient = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const { products, redeemableProducts, loading, error, refetchProducts } = useProducts();
  const [tab, setTab] = useState('catalog');

  const [points, setPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submittingRedeem, setSubmittingRedeem] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);

  const clientId = user?.clientId || user?.uid || user?._id;

  const refreshPoints = useCallback(async () => {
    if (!token || !clientId) return;
    try {
      const res = await fetchClientPoints(token, clientId);
      setPoints(res.data?.points || 0);
    } catch (err) {
      console.error('Error fetching client points:', err);
    }
  }, [token, clientId]);

  useEffect(() => {
    if (!token || !clientId) {
      Promise.resolve().then(() => setLoadingPoints(false));
      return;
    }
    fetchClientPoints(token, clientId)
      .then((res) => {
        setPoints(res.data?.points || 0);
      })
      .catch((err) => {
        console.error('Error fetching client points:', err);
      })
      .finally(() => {
        setLoadingPoints(false);
      });
  }, [token, clientId]);

  const stats = useMemo(() => ({
    catalog: products.length,
    redeemable: redeemableProducts.length,
  }), [products, redeemableProducts]);

  const activeList = tab === 'catalog' ? products : redeemableProducts;
  const emptyMessage = tab === 'catalog'
    ? 'Aún no hay productos activos disponibles para mostrar.'
    : 'No hay productos habilitados para canjear con puntos.';

  const handleOpenRedeem = (product) => {
    setSelectedProduct(product);
    setShowConfirm(true);
    setRedeemSuccess('');
    setRedeemError('');
  };

  const handleConfirmRedeem = async () => {
    if (!selectedProduct) return;
    setSubmittingRedeem(true);
    setRedeemError('');
    setRedeemSuccess('');
    try {
      const res = await axiosAdmin.post('/sales/create', {
        details: [
          {
            referenceId: selectedProduct._id || selectedProduct.id,
            detailType: 'PRODUCT',
            quantity: 1,
          },
        ],
        itemsWithPoints: {
          [selectedProduct._id || selectedProduct.id]: true,
        },
      });

      if (res.data?.success) {
        setRedeemSuccess(`¡Canje exitoso! Has canjeado "${selectedProduct.name}" por ${selectedProduct.pointsPrice} pts.`);
        // Reload points and products
        refreshPoints();
        refetchProducts();
      } else {
        throw new Error(res.data?.message || 'Error en el canje');
      }
    } catch (err) {
      setRedeemError(err.response?.data?.message || err.message || 'Error al procesar el canje');
    } finally {
      setSubmittingRedeem(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <ProductPageHeader
          title="Productos"
          subtitle="Explora el catálogo y los productos que puedes canjear con tus puntos."
        />

        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />

        {/* Stats and User Points Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A] font-semibold">Tus Puntos acumulados</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#00D2C4] drop-shadow-[0_0_10px_rgba(0,210,196,0.2)]">
                {loadingPoints ? '...' : points}
              </span>
              <span className="text-[12px] text-zinc-500 uppercase font-bold">pts</span>
            </div>
          </div>
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A] font-semibold">Catálogo activo</div>
            <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.catalog}</div>
          </div>
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A] font-semibold">Canjeables</div>
            <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.redeemable}</div>
          </div>
        </div>

        {/* Feedback Alert Messages */}
        {redeemSuccess && (
          <div className="bg-[#152A2A] border border-[#205A50] rounded-xl px-4 py-3.5 text-[13px] text-[#8EE] mb-6 flex items-center gap-3 animate-fadeIn">
            <i className="ti ti-circle-check text-xl" aria-hidden="true" />
            <span className="font-medium">{redeemSuccess}</span>
          </div>
        )}

        {redeemError && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3.5 text-[13px] text-[#E88] mb-6 flex items-center gap-3 animate-fadeIn">
            <i className="ti ti-alert-circle text-xl" aria-hidden="true" />
            <span className="font-medium">{redeemError}</span>
          </div>
        )}

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
              <ProductCard
                key={product._id || product.id}
                product={product}
                mode="client"
                userPoints={points}
                onRedeem={() => handleOpenRedeem(product)}
                onDetail={setDetailProduct}
              />
            ))}
          </div>
        )}
      </main>

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmRedeem}
        title="¿Canjear producto?"
        message={selectedProduct ? `¿Estás seguro de que deseas canjear "${selectedProduct.name}" por ${selectedProduct.pointsPrice} puntos? Se descontará de tus puntos acumulados.` : ''}
        confirmText={submittingRedeem ? 'Canjeando...' : 'Confirmar canje'}
        cancelText="Cancelar"
        variant="info"
      />
    </div>
  );
};