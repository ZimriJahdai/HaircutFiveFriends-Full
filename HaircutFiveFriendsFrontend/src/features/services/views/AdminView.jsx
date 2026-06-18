import { useState, useEffect } from 'react';
import { deleteService } from '../../../shared/api/service.js';
import { ServiceModal } from '../components/ServiceModal.jsx';

const CATEGORY_LABELS_SHORT = {
  CORTE_DE_CABELLO: 'Corte',
  AFEITADO: 'Afeitado',
  RECORTES_DE_BARBA: 'Barba',
  ARREGLO_DE_CABELLO: 'Arreglo',
  TRATAMIENTOS_CAPILARES: 'Cap.',
  TRATAMIENTOS_FACIALES: 'Facial',
};

const ADMIN_FILTERS = ['Todos', 'activo', 'inactivo'];

export const AdminView = ({ services, loading, error: storeError, getServices }) => {
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
  const handleSuccess = (msg) => { setSuccess(msg); closeModal(); getServices(); };

  const handleDelete = async (s) => {
    if (!window.confirm(`¿Eliminar "${s.name}"?`)) return;
    try { await deleteService(s._id); setSuccess('Servicio eliminado'); getServices(); }
    catch (err) { setLocalError(err.response?.data?.message || 'Error al eliminar'); }
  };

  const filtered = filter === 'Todos' ? services : services.filter(s => s.status === filter);
  const displayError = localError || storeError;

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none"
          onClick={openCreate}
        >
          <i className="ti ti-plus text-[16px]" />
          Nuevo servicio
        </button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {ADMIN_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-md text-[12px] border transition-colors cursor-pointer focus:outline-none"
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
          <button onClick={openCreate} className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors mt-2 focus:outline-none">
            <i className="ti ti-plus" />Crear servicio
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E1E1E' }}>
                {['Nombre', 'Categoría', 'Precio', 'Puntos', 'Duración', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#5A5A5A', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #151515' }} className="hover:bg-[#1A1A1A] transition-colors">
                  <td style={{ padding: '12px' }}>
                    <div style={{ color: '#E8E4DC', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ color: '#555', fontSize: '11px', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#C9A84C18', border: '1px solid #C9A84C33', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: '#C9A84C' }}>
                      {CATEGORY_LABELS_SHORT[s.category] || s.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#E8E4DC', fontWeight: 500 }}>{s.price}</td>
                  <td style={{ padding: '12px', color: '#5A5A5A' }}>{s.pointsPrice || '—'}</td>
                  <td style={{ padding: '12px', color: '#5A5A5A' }}>{s.duration}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: s.status === 'activo' ? '#152A15' : '#1A1A1A', border: `1px solid ${s.status === 'activo' ? '#205A20' : '#2A2A2A'}`, color: s.status === 'activo' ? '#8E8' : '#555', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(s)} className="flex items-center gap-1 px-2.5 py-1.5 bg-transparent border border-[#2A2A2A] text-[#AAA] hover:text-[#C9A84C] hover:border-[#C9A84C44] rounded text-[12px] cursor-pointer transition-colors focus:outline-none">
                        <i className="ti ti-edit text-[14px]" />
                      </button>
                      <button onClick={() => handleDelete(s)} className="flex items-center gap-1 px-2.5 py-1.5 bg-transparent border border-[#2A2A2A] text-[#AAA] hover:text-[#E88] hover:border-[#5A2020] rounded text-[12px] cursor-pointer transition-colors focus:outline-none">
                        <i className="ti ti-trash text-[14px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <ServiceModal editing={editing} onClose={closeModal} onSuccess={handleSuccess} />}
    </>
  );
};
