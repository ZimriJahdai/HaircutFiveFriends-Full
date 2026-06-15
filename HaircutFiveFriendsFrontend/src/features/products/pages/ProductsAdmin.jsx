import { useEffect, useMemo, useState } from 'react';
import { deleteProduct, getProducts } from '../../../shared/api/product';
import { ProductAlerts } from '../components/ProductAlerts';
import { ProductCard } from '../components/ProductCard';
import { ProductEmptyState } from '../components/ProductEmptyState';
import { ProductModal } from '../components/ProductModal';
import { ProductPageHeader } from '../components/ProductPageHeader';

export const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProducts();
      setProducts(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getProducts();
        if (!ignore) {
          setProducts(response.data?.data || []);
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

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((product) => product.status === 'active').length,
    redeemable: products.filter((product) => Number(product.pointsPrice || 0) > 0).length,
  }), [products]);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (product) => {
    setEditing(product);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSuccess = (message) => {
    setSuccess(message);
    closeModal();
    void loadProducts();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return;
    setError('');

    try {
      await deleteProduct(product._id || product.id);
      setSuccess('Producto eliminado exitosamente');
      void loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el producto');
    }
  };

  const variant = loading ? 'loading' : products.length === 0 ? 'empty' : null;

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      <ProductPageHeader
        title="Productos"
        subtitle="Administra el catálogo, precios y stock de tus productos."
        actionLabel="Agregar producto"
        onAction={openCreate}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
          <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">Total</div>
          <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
          <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">Activos</div>
          <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.active}</div>
        </div>
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
          <div className="text-[11px] uppercase tracking-[2px] text-[#5A5A5A]">Canjeables</div>
          <div className="mt-2 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] text-[#E8E4DC]">{stats.redeemable}</div>
        </div>
      </div>

      <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

      <ProductAlerts error={error} success={success} />

      {variant ? (
        variant === 'loading' ? (
          <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-[13px]">
            <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
            <span>Cargando productos…</span>
          </div>
        ) : (
          <ProductEmptyState
            title="No hay productos registrados"
            subtitle="Agrega el primer producto para que el catálogo esté disponible en admin y cliente."
            actionLabel="Crear producto"
            onAction={openCreate}
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              mode="admin"
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          key={editing?._id || editing?.id || 'new'}
          editing={editing}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};