import { useState, useEffect } from 'react';
import { useBarberStore } from '../store/useBarberStore';
import { deleteBarber } from '../../../shared/api/barber';
import { BarberCard } from '../components/BarberCard';
import { BarberModal } from '../components/BarberModal';
import { BarberPageHeader } from '../components/BarberPageHeader';
import { BarberAlerts } from '../components/BarberAlerts';
import { BarberEmptyState } from '../components/BarberEmptyState';

export const Barber = () => {
  const { barbers, loading, error: storeError, getBarbers } = useBarberStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { getBarbers(); }, [getBarbers]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const openCreate = () => { setEditing(null); setShowModal(true); setLocalError(''); setSuccess(''); };
  const openEdit = (barber) => { setEditing(barber); setShowModal(true); setLocalError(''); setSuccess(''); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleModalSuccess = (message) => { setSuccess(message); closeModal(); getBarbers(); };

  const handleDelete = async (barber) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${barber.name}?`)) return;
    setLocalError('');
    try {
      await deleteBarber(barber._id);
      setSuccess('Barbero eliminado exitosamente');
      getBarbers();
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Error al eliminar el barbero');
    }
  };

  const getVariant = () => {
    if (loading) return 'loading';
    if (!barbers || barbers.length === 0) return 'empty';
    return null;
  };

  const variant = getVariant();

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      <BarberPageHeader onAdd={openCreate} />

      <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

      <BarberAlerts error={localError || storeError} success={success} />

      {variant ? (
        <BarberEmptyState variant={variant} onAdd={openCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {barbers.map((barber) => (
            <BarberCard
              key={barber._id}
              barber={barber}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BarberModal editing={editing} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
    </div>
  );
};
