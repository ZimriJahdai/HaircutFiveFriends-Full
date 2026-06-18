import { useState, useEffect } from 'react';
import { getAllServices } from '../../../shared/api/service';
import { axiosAdmin } from '../../../shared/api/api';
import { useReviewStore } from '../store/useReviewStore';

export const useReviewForm = () => {
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

  const storeCreateReview = useReviewStore((s) => s.createReview);

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

      await storeCreateReview(payload);
      setSuccess('¡Reseña publicada!');
      setShowForm(false);
      setForm({ score: 5, comment: '', type: 'barbero', targetId: '' });
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Error al publicar reseña');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    services,
    barbers,
    form,
    setForm,
    showForm,
    setShowForm,
    saving,
    error,
    success,
    submit,
  };
};
