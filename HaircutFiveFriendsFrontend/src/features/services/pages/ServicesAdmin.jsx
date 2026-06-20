import { useState, useEffect } from 'react';
import { useServices } from '../hooks/useServices.js';
import { deleteService } from '../../../shared/api/service.js';
import { ServiceModal } from '../components/ServiceModal.jsx';
import { ServiceTable } from '../components/ServiceTable.jsx';

const ADMIN_FILTERS = ['Todos', 'activo', 'inactivo'];

export const ServicesAdmin = () => {
  const { services, loading, error: storeError, refetchServices } = useServices();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const openCreate = () => { setEditing(null); setShowModal(true); setLocalError(''); setSuccess(''); };
  const openEdit = (s) => { setEditing(s); setShowModal(true); setLocalError(''); setSuccess(''); };
  const closeModal = () => { setShowModal(false); setEditing(null); };
  const handleSuccess = (msg) => { setSuccess(msg); closeModal(); refetchServices(); };
  const handleDelete = async (s) => {
    if (!window.confirm(`¿Eliminar "${s.name}"?`)) return;
    try { await deleteService(s._id); setSuccess('Servicio eliminado'); refetchServices(); }
    catch (err) { setLocalError(err.response?.data?.message || 'Error al eliminar'); }
  };

  const filtered = filter === 'Todos' ? services : services.filter(s => s.status === filter);
  const displayError = localError || storeError;

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0 mb-1 leading-none">Servicios</h1>
          <p className="text-[13px] text-[#5A5A5A] m-0">Gestiona el catálogo de servicios de la barbería.</p>
        </div>
      </div>
      <div className="h-[1px] bg-[#C9A84C]/20 mb-4" />

      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors">
          <i className="ti ti-plus text-[16px]" /> Nuevo servicio
        </button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {ADMIN_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-md text-[12px] border transition-colors cursor-pointer"
            style={{ background: filter === f ? '#C9A84C18' : 'transparent', border: `1px solid ${filter === f ? '#C9A84C44' : '#2A2A2A'}`, color: filter === f ? '#C9A84C' : '#555' }}>
            {f === 'Todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-[#555] self-center">
          {filtered.length} servicio{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {displayError && (
        <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] mb-4 flex items-center gap-2">
          <i className="ti ti-alert-circle text-lg" />{displayError}
        </div>
      )}
      {success && (
        <div className="bg-[#152A15] border border-[#205A20] rounded-lg px-3.5 py-2.5 text-[12px] text-[#8E8] mb-4 flex items-center gap-2">
          <i className="ti ti-check text-lg" />{success}
        </div>
      )}

      {loading ? null : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 py-16 text-[#5A5A5A] text-[14px] text-center">
          <i className="ti ti-scissors text-5xl text-[#333]" />
          <h3 className="m-0 text-[#E8E4DC] text-[16px] font-semibold">
            No hay servicios{filter !== 'Todos' ? ` con estado "${filter}"` : ''}
          </h3>
          <button onClick={openCreate} className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors mt-2">
            <i className="ti ti-plus" />Crear servicio
          </button>
        </div>
      ) : (
        <ServiceTable services={filtered} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {showModal && <ServiceModal editing={editing} onClose={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
};
