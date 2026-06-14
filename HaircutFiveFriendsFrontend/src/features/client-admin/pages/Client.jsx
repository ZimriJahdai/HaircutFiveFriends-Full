import { useState, useEffect } from 'react';
import { useClientStore } from '../store/useClientStore';
import { deleteClient } from '../../../shared/api/client';
import { ClientCard } from '../components/ClientCard';
import { ClientModal } from '../components/ClientModal';
import { ClientPageHeader } from '../components/ClientPageHeader';
import { ClientAlerts } from '../components/ClientAlerts';
import { ClientEmptyState } from '../components/ClientEmptyState';

export const Client = () => {
  const { clients, loading, error: storeError, getClients } = useClientStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { getClients(); }, [getClients]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const openCreate = () => { setEditing(null); setShowModal(true); setLocalError(''); setSuccess(''); };
  const openEdit = (client) => { setEditing(client); setShowModal(true); setLocalError(''); setSuccess(''); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleModalSuccess = (message) => { setSuccess(message); closeModal(); getClients(); };

  const handleDelete = async (client) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${client.name}?`)) return;
    setLocalError('');
    try {
      await deleteClient(client._id);
      setSuccess('Cliente eliminado exitosamente');
      getClients();
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Error al eliminar el cliente');
    }
  };

  const getVariant = () => {
    if (loading) return 'loading';
    if (!clients || clients.length === 0) return 'empty';
    return null;
  };

  const variant = getVariant();

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      <ClientPageHeader onAdd={openCreate} />

      <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

      <ClientAlerts error={localError || storeError} success={success} />

      {variant ? (
        <ClientEmptyState variant={variant} onAdd={openCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal editing={editing} onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
    </div>
  );
};
