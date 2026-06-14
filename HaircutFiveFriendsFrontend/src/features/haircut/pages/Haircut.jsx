import { useState, useEffect } from 'react';
import { useHaircutStore } from '../store/useHaircutStore';
import { deleteHaircut } from '../../../shared/api/haircut';
import { HaircutCard } from '../components/HaircutCard';
import { HaircutModal } from '../components/HaircutModal';

export const Haircut = () => {
  const { haircut: haircuts, loading, error: storeError, getHaircut } = useHaircutStore();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getHaircut();
  }, [getHaircut]);

  // Auto-clear success
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  /* ── Modal helpers ── */
  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
    setLocalError('');
    setSuccess('');
  };

  const openEdit = (h) => {
    setEditing(h);
    setShowModal(true);
    setLocalError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleModalSuccess = (message) => {
    setSuccess(message);
    closeModal();
    getHaircut();
  };

  const handleDelete = async (h) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${h.name}"?`)) return;
    setLocalError('');
    try {
      await deleteHaircut(h._id);
      setSuccess('Corte eliminado exitosamente');
      getHaircut();
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Error al eliminar el corte');
    }
  };

  const displayError = localError || storeError;

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0 mb-1 leading-none">
            Cortes de Cabello
          </h1>
          <p className="text-[13px] text-[#5A5A5A] m-0">Explora nuestros cortes y elige tu estilo.</p>
        </div>
        <button
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none"
          onClick={openCreate}
        >
          <i className="ti ti-plus text-[16px]" aria-hidden="true" />
          Agregar corte
        </button>
      </div>

      <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

      {/* ── Messages ── */}
      {displayError && (
        <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] mb-4 flex items-center gap-2">
          <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
          {displayError}
        </div>
      )}
      {success && (
        <div className="bg-[#152A15] border border-[#205A20] rounded-lg px-3.5 py-2.5 text-[12px] text-[#8E8] mb-4 flex items-center gap-2">
          <i className="ti ti-check text-lg" aria-hidden="true" />
          {success}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-[13px]">
          <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
          <span>Cargando cortes…</span>
        </div>
      ) : !haircuts || haircuts.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 py-16 text-[#5A5A5A] text-[14px] text-center">
          <i className="ti ti-scissors text-5xl text-[#333]" aria-hidden="true" />
          <h3 className="m-0 text-[#E8E4DC] text-[16px] font-semibold">No hay cortes registrados</h3>
          <p className="m-0 text-[#5A5A5A] text-[13px]">Crea tu primer corte para empezar</p>
          <button
            className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors mt-2 focus:outline-none"
            onClick={openCreate}
          >
            <i className="ti ti-plus text-[16px]" aria-hidden="true" />
            Crear Corte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {haircuts.map((h) => (
            <HaircutCard
              key={h._id}
              haircut={h}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ══ Modal ═══════════════════════════════════════════ */}
      {showModal && (
        <HaircutModal
          editing={editing}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};
