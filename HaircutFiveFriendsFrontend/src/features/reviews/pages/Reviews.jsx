import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import {
  getAllReviews,
  createReview,
  deleteReview,
} from '../../../shared/api/review.js';
import { getAllServices } from '../../../shared/api/service.js';
import { axiosAdmin } from '../../../shared/api/api.js';

// ─── Componentes compartidos ──────────────────────────────────────────────────

const STARS = [1, 2, 3, 4, 5];

const StarDisplay = ({ value }) => (
  <span style={{ color: '#C9A84C', fontSize: '14px' }}>
    {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
  </span>
);

const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {STARS.map(n => (
        <span
          key={n}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: readonly ? '16px' : '22px',
            cursor: readonly ? 'default' : 'pointer',
            color: n <= (hovered || value) ? '#C9A84C' : '#2A2A2A',
            transition: 'color 0.1s',
          }}
        >★</span>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, clientId, isAdmin, onDelete }) => {
  const isOwn = review.clienteId?._id === clientId || review.clienteId === clientId;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    setDeleting(true);
    try { await deleteReview(review._id); onDelete(review._id); }
    catch { setDeleting(false); }
  };

  const targetName = review.barberoId?.name || review.servicioId?.name || 'General';
  const targetType = review.barberoId ? 'Barbero' : 'Servicio';
  const clientName = review.clienteId?.name || 'Cliente';
  const initials = clientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' });

  if (isAdmin) {
    return (
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '1rem', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#C9A84C22', border: '1px solid #C9A84C44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: '#C9A84C', flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ color: '#E8E4DC', fontSize: '13px', fontWeight: 500 }}>{clientName}</span>
            <StarDisplay value={review.score} />
            <span style={{ fontSize: '11px', color: '#555', marginLeft: 'auto' }}>{date}</span>
          </div>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px', lineHeight: 1.6 }}>{review.comment}</p>
          <span style={{ fontSize: '11px', color: '#555' }}>
            <i className={`ti ${review.barberoId ? 'ti-id-badge' : 'ti-scissors'}`} style={{ marginRight: '4px' }} />
            {targetType}: <span style={{ color: '#777' }}>{targetName}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#C9A84C22', border: '1px solid #C9A84C44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: '#C9A84C', flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ color: '#E8E4DC', fontSize: '13px', fontWeight: 500 }}>{clientName}</div>
            <div style={{ color: '#555', fontSize: '11px' }}>{date}</div>
          </div>
        </div>
        {isOwn && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '4px 8px', color: '#555', cursor: 'pointer', fontSize: '13px', transition: 'color 0.15s, border-color 0.15s' }}
            className="hover:text-[#E88] hover:border-[#5A2020]"
          >
            <i className="ti ti-trash" />
          </button>
        )}
      </div>
      <StarRating value={review.score} readonly />
      <p style={{ color: '#AAA', fontSize: '13px', margin: '8px 0 0', lineHeight: 1.6 }}>{review.comment}</p>
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #222', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#555' }}>
          <i className={`ti ${review.barberoId ? 'ti-id-badge' : 'ti-scissors'}`} style={{ marginRight: '4px' }} />
          {targetType}: <span style={{ color: '#777' }}>{targetName}</span>
        </span>
      </div>
    </div>
  );
};

// ─── Vista Admin ──────────────────────────────────────────────────────────────

const AdminView = ({ reviews, loading }) => {
  const [filter, setFilter] = useState('todos');
  const chartRef = useRef(null);
  const barChartRef = useRef(null);
  const chartInstance = useRef(null);
  const barChartInstance = useRef(null);

  const totalReviews = reviews.length;
  const avg = totalReviews ? (reviews.reduce((a, r) => a + r.score, 0) / totalReviews).toFixed(1) : '0.0';

  const scoreDist = [1, 2, 3, 4, 5].map(n => ({
    score: n,
    count: reviews.filter(r => r.score === n).length,
  }));

  const barberMap = {};
  reviews.filter(r => r.barberoId).forEach(r => {
    const name = r.barberoId?.name || 'Desconocido';
    const id = r.barberoId?._id || r.barberoId;
    if (!barberMap[id]) barberMap[id] = { name, scores: [] };
    barberMap[id].scores.push(r.score);
  });
  const barberAvgs = Object.values(barberMap).map(b => ({
    name: b.name,
    avg: (b.scores.reduce((a, s) => a + s, 0) / b.scores.length).toFixed(1),
    count: b.scores.length,
  })).sort((a, b) => b.avg - a.avg);

  useEffect(() => {
    if (loading || !chartRef.current) return;
    const buildChart = () => {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
          datasets: [{ label: 'Reseñas', data: scoreDist.map(s => s.count), backgroundColor: ['#5A1A1A', '#8A4020', '#8A6A10', '#A08030', '#C9A84C'], borderRadius: 4, borderSkipped: false }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#777', font: { size: 12 } }, grid: { color: '#1A1A1A' } }, y: { ticks: { color: '#777', font: { size: 12 }, stepSize: 1 }, grid: { color: '#1E1E1E' }, beginAtZero: true } } },
      });
    };
    if (window.Chart) { buildChart(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = buildChart;
    document.head.appendChild(script);
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [loading, reviews]);

  useEffect(() => {
    if (loading || !barChartRef.current || barberAvgs.length === 0) return;
    const buildBarChart = () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      barChartInstance.current = new window.Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: barberAvgs.map(b => b.name),
          datasets: [{ label: 'Promedio', data: barberAvgs.map(b => parseFloat(b.avg)), backgroundColor: '#C9A84C', borderRadius: 4, borderSkipped: false }],
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 5, ticks: { color: '#777', font: { size: 12 } }, grid: { color: '#1E1E1E' } }, y: { ticks: { color: '#AAA', font: { size: 12 } }, grid: { color: '#1A1A1A' } } } },
      });
    };
    if (window.Chart) { buildBarChart(); return; }
    const t = setInterval(() => { if (window.Chart) { clearInterval(t); buildBarChart(); } }, 100);
    return () => { clearInterval(t); if (barChartInstance.current) barChartInstance.current.destroy(); };
  }, [loading, reviews]);

  const filtered = filter === 'todos' ? reviews
    : filter === 'barbero' ? reviews.filter(r => r.barberoId)
    : reviews.filter(r => r.servicioId);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total reseñas', value: totalReviews, icon: 'ti-message' },
          { label: 'Calificación promedio', value: `${avg} ★`, icon: 'ti-star' },
          { label: 'Barberos evaluados', value: barberAvgs.length, icon: 'ti-id-badge' },
          { label: 'Reseñas de servicio', value: reviews.filter(r => r.servicioId).length, icon: 'ti-scissors' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1A1A1A', borderLeft: '3px solid #C9A84C', borderRadius: '0 8px 8px 0', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#5A5A5A' }}>{k.label}</span>
              <i className={`ti ${k.icon}`} style={{ fontSize: '16px', color: '#C9A84C', opacity: 0.5 }} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '26px', letterSpacing: '1px', color: '#E8E4DC', lineHeight: 1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '1.75rem' }}>
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '10px', color: '#5A5A5A', letterSpacing: '2px', textTransform: 'uppercase' }}>Distribución de puntuaciones</p>
          <div style={{ position: 'relative', height: '200px' }}>
            <canvas ref={chartRef} role="img" aria-label="Gráfica de distribución de puntuaciones del 1 al 5" />
          </div>
        </div>
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '10px', color: '#5A5A5A', letterSpacing: '2px', textTransform: 'uppercase' }}>Promedio por barbero</p>
          {barberAvgs.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '13px' }}>Sin datos de barberos</div>
          ) : (
            <div style={{ position: 'relative', height: Math.max(200, barberAvgs.length * 44 + 40) + 'px' }}>
              <canvas ref={barChartRef} role="img" aria-label="Gráfica horizontal de promedio de calificaciones por barbero" />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {[['todos', 'Todas'], ['barbero', 'Por barbero'], ['servicio', 'Por servicio']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', background: filter === k ? '#C9A84C18' : 'transparent', borderColor: filter === k ? '#C9A84C44' : '#2A2A2A', color: filter === k ? '#C9A84C' : '#555' }}
          >{l}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#555', alignSelf: 'center' }}>{filtered.length} reseñas</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#333', fontSize: '14px' }}>No hay reseñas con este filtro.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(r => (
            <ReviewCard key={r._id} review={r} isAdmin onDelete={() => {}} />
          ))}
        </div>
      )}
    </>
  );
};

// ─── Vista Cliente ────────────────────────────────────────────────────────────

const ClientView = ({ reviews, setReviews, loading, clientId }) => {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ score: 5, comment: '', type: 'barbero', targetId: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('todas');

  useEffect(() => {
    Promise.all([
      getAllServices(),
      axiosAdmin.get('/barbers').then(r => r.data),
    ]).then(([sv, bv]) => {
      setServices(sv.data || []);
      setBarbers(bv.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); }
  }, [success]);

  const handleRemove = (id) => {
    setReviews(r => r.filter(x => x._id !== id));
    setSuccess('Reseña eliminada');
  };

  const handleSubmit = async () => {
    if (!form.targetId) { setFormError('Selecciona un barbero o servicio'); return; }
    if (!form.comment.trim()) { setFormError('Escribe un comentario'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = { score: form.score, comment: form.comment };
      if (form.type === 'barbero') payload.barberoId = form.targetId;
      else payload.servicioName = services.find(s => s._id === form.targetId)?.name || '';
      await createReview(payload);
      const full = await getAllReviews();
      setReviews(full.data || []);
      setSuccess('¡Reseña publicada!');
      setShowForm(false);
      setForm({ score: 5, comment: '', type: 'barbero', targetId: '' });
    } catch (e) {
      setFormError(e.response?.data?.message || 'Error al publicar la reseña');
    } finally { setSaving(false); }
  };

  const filtered = tab === 'mias'
    ? reviews.filter(r => r.clienteId?._id === clientId || r.clienteId === clientId)
    : reviews;

  const avg = filtered.length ? (filtered.reduce((a, r) => a + r.score, 0) / filtered.length).toFixed(1) : '—';

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none"
        >
          <i className={`ti ${showForm ? 'ti-x' : 'ti-pencil'} text-[16px]`} />
          {showForm ? 'Cancelar' : 'Escribir reseña'}
        </button>
      </div>

      {success && (
        <div className="bg-[#152A15] border border-[#205A20] rounded-lg px-3.5 py-2.5 text-[12px] text-[#8E8] mb-4 flex items-center gap-2">
          <i className="ti ti-check" />{success}
        </div>
      )}

      {showForm && (
        <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontFamily: "'Bebas Neue',sans-serif", fontSize: '18px', letterSpacing: '1.5px', color: '#E8E4DC' }}>Nueva reseña</h3>
          {formError && (
            <div style={{ background: '#2A1515', border: '1px solid #5A2020', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#E88', marginBottom: '12px', display: 'flex', gap: '8px' }}>
              <i className="ti ti-alert-circle" />{formError}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#5A5A5A', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Calificación</label>
              <StarRating value={form.score} onChange={v => setForm(f => ({ ...f, score: v }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#5A5A5A', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Tipo</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, targetId: '' }))}
                  style={{ width: '100%', background: '#0F0F0F', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '9px 12px', color: '#E8E4DC', fontSize: '13px', outline: 'none' }}>
                  <option value="barbero">Barbero</option>
                  <option value="servicio">Servicio</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#5A5A5A', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                  {form.type === 'barbero' ? 'Barbero' : 'Servicio'}
                </label>
                <select value={form.targetId} onChange={e => setForm(f => ({ ...f, targetId: e.target.value }))}
                  style={{ width: '100%', background: '#0F0F0F', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '9px 12px', color: '#E8E4DC', fontSize: '13px', outline: 'none' }}>
                  <option value="">Seleccionar…</option>
                  {(form.type === 'barbero' ? barbers : services).map(x => (
                    <option key={x._id} value={x._id}>{x.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#5A5A5A', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Comentario</label>
              <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Cuéntanos tu experiencia…"
                style={{ width: '100%', background: '#0F0F0F', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '9px 12px', color: '#E8E4DC', fontSize: '13px', outline: 'none', height: '80px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSubmit} disabled={saving}
                style={{ background: saving ? '#A08030' : '#C9A84C', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#0A0A0A', fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {saving && <div style={{ width: '12px', height: '12px', border: '2px solid #0A0A0A44', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                {saving ? 'Publicando…' : 'Publicar reseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2px', marginBottom: '1.25rem', background: '#111', borderRadius: '8px', padding: '4px', border: '1px solid #1E1E1E' }}>
        {[['todas', 'Todas las reseñas'], ['mias', 'Mis reseñas']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex: 1, padding: '7px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s, color 0.15s', background: tab === k ? '#1A1A1A' : 'transparent', color: tab === k ? '#E8E4DC' : '#555' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '24px', color: '#C9A84C' }}>{filtered.length}</span>
          <span style={{ fontSize: '12px', color: '#555' }}>reseñas</span>
        </div>
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '24px', color: '#C9A84C' }}>{avg}</span>
          <span style={{ fontSize: '12px', color: '#555' }}>promedio ★</span>
        </div>
      </div>

      {loading ? null : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-center">
          <i className="ti ti-message-off text-5xl text-[#333]" />
          <p className="text-[14px]">{tab === 'mias' ? 'Aún no has escrito ninguna reseña.' : 'No hay reseñas todavía.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(r => (
            <ReviewCard key={r._id} review={r} clientId={clientId} isAdmin={false} onDelete={handleRemove} />
          ))}
        </div>
      )}
    </>
  );
};

// ─── Componente principal unificado ──────────────────────────────────────────

export const Reviews = () => {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'ADMIN_ROLE';
  const clientId = user?.clientId || user?.uid || user?._id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReviews()
      .then(r => { setReviews(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const subtitle = isAdmin
    ? 'Vista general de las calificaciones recibidas.'
    : 'Comparte tu experiencia con Five Friends.';

  return (
    <div className="font-sans text-[#E8E4DC] w-full">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <div className="mb-6">
        <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0 mb-1 leading-none">Reseñas</h1>
        <p className="text-[13px] text-[#5A5A5A] m-0">{subtitle}</p>
      </div>
      <div className="h-[1px] bg-[#C9A84C]/20 mb-6" />

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-[#5A5A5A] text-[13px]">
          <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
          <span>Cargando reseñas…</span>
        </div>
      ) : isAdmin ? (
        <AdminView reviews={reviews} loading={loading} />
      ) : (
        <ClientView reviews={reviews} setReviews={setReviews} loading={loading} clientId={clientId} />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
