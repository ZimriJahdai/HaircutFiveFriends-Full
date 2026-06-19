import { useState, useEffect } from 'react';
import { getAllServices } from '../../../shared/api/service';
import { createReview } from '../../../shared/api/review';
import { axiosAdmin } from '../../../shared/api/api';
import { StarRating } from './StarRating';

export const ReviewForm = () => {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    score: 5,
    comment: '',
    type: 'barbero',
    targetId: '',
  });

  useEffect(() => {
    Promise.all([
      getAllServices(),
      axiosAdmin.get('/barbers').then((res) => res.data),
    ])
      .then(([servicesResponse, barbersResponse]) => {
        setServices(servicesResponse.data || []);
        setBarbers(barbersResponse.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const submit = async () => {
    if (!form.targetId) {
      setError('Selecciona un barbero o servicio');
      return;
    }
    if (!form.comment.trim()) {
      setError('Escribe un comentario');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = { score: form.score, comment: form.comment };
      if (form.type === 'barbero') {
        payload.barberoId = form.targetId;
      } else {
        payload.servicioName =
          services.find((s) => s._id === form.targetId)?.name || '';
      }

      await createReview(payload);
      setSuccess('¡Reseña publicada!');
      setShowForm(false);
      setForm({ score: 5, comment: '', type: 'barbero', targetId: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Error al publicar reseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#00D2C4] text-[#00D2C4] hover:text-[#0A0A0A] border border-[#00D2C4] rounded-xl px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors"
        >
          <i className={`ti ${showForm ? 'ti-x' : 'ti-pencil'}`} />
          {showForm ? 'Cancelar' : 'Escribir reseña'}
        </button>
      </div>

      {success && (
        <div className="bg-[#152A15] border border-[#205A20] text-[#8E8] px-3 py-2.5 rounded-xl text-[12px] mt-4 flex items-center gap-2">
          <i className="ti ti-check" /> {success}
        </div>
      )}

      {showForm && (
        <div className="bg-[#111] border border-[#1E1E1E] rounded-2xl p-6 mt-4">
          <h3 className="text-[#E8E4DC] text-[16px] font-semibold mb-4 m-0">Nueva reseña</h3>

          {error && (
            <div className="bg-[#2A1515] border border-[#5A2020] text-[#E88] px-3 py-2.5 rounded-xl text-[12px] mb-4 flex items-center gap-2">
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          <StarRating value={form.score} onChange={(value) => setForm({ ...form, score: value })} />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value, targetId: '' })}
            className="w-full mt-4 bg-[#0A0A0A] text-[#E8E4DC] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#00D2C4]/50"
          >
            <option value="barbero">Barbero</option>
            <option value="servicio">Servicio</option>
          </select>

          <select
            value={form.targetId}
            onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            className="w-full mt-3 bg-[#0A0A0A] text-[#E8E4DC] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#00D2C4]/50"
          >
            <option value="">Seleccionar...</option>
            {(form.type === 'barbero' ? barbers : services).map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>

          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Cuéntanos tu experiencia..."
            className="w-full h-24 mt-3 bg-[#0A0A0A] text-[#E8E4DC] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-[13px] placeholder-[#5A5A5A] focus:outline-none focus:border-[#00D2C4]/50 resize-none"
          />

          <button
            disabled={saving}
            onClick={submit}
            className="mt-4 bg-[#00D2C4] text-[#0A0A0A] border-none rounded-xl px-5 py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00D2C4]/90 transition-colors"
          >
            {saving ? 'Publicando...' : 'Publicar reseña'}
          </button>
        </div>
      )}
    </div>
  );
};
