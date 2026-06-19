import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { useDashboardStats } from '../../features/auth/hooks/useDashboardStats.js';

const STATUS_COLORS = {
  CONFIRMADO: { bg: '#1A3A1A', text: '#5DBD5D', border: '#2A5A2A' },
  PENDIENTE: { bg: '#3A2A0A', text: '#C9A84C', border: '#5A3A0A' },
  COMPLETADO: { bg: '#0A2A3A', text: '#5ABDD0', border: '#0A4A5A' },
  CANCELADO: { bg: '#3A0A0A', text: '#E07070', border: '#5A0A0A' },
};

/* ─── LineChart ─────────────────────────────────────────────── */
function LineChart({ salesByDay }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !salesByDay?.length) return;
    const labels = salesByDay.map(d => d.label);
    const data = salesByDay.map(d => d.total);

    const build = () => {
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 220);
      grad.addColorStop(0, 'rgba(201,168,76,0.25)');
      grad.addColorStop(1, 'rgba(201,168,76,0.00)');

      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data,
            borderColor: '#C9A84C',
            borderWidth: 2,
            backgroundColor: grad,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#C9A84C',
            pointBorderColor: '#111',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: ctx => ` Q${ctx.parsed.y.toFixed(0)}` },
              backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', borderWidth: 1,
              titleColor: '#FFFFFF', bodyColor: '#C9A84C', padding: 10,
            },
          },
          scales: {
            x: { ticks: { color: '#555', font: { size: 11 } }, grid: { color: '#1A1A1A' } },
            y: { ticks: { color: '#555', font: { size: 11 }, callback: v => `Q${v}` }, grid: { color: '#1A1A1A' }, beginAtZero: true },
          },
        },
      });
    };

    if (window.Chart) { build(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = build;
    document.head.appendChild(script);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [salesByDay]);

  return (
    <div className="relative h-[220px] overflow-hidden">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
  );
}

/* ─── DonutChart ────────────────────────────────────────────── */
function DonutChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const colors = ['#A08030', '#C9A84C', '#4A8A4A', '#8A2020'];
    const labels = (data || []).map(d => d.label);
    const values = (data || []).map(d => d.count);

    const build = () => {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#888', font: { size: 11 }, boxWidth: 10, padding: 14 } },
            tooltip: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', borderWidth: 1, titleColor: '#FFF', bodyColor: '#AAA' },
          },
          cutout: '68%',
        },
      });
    };

    if (window.Chart) { build(); return; }
    const t = setInterval(() => { if (window.Chart) { clearInterval(t); build(); } }, 100);
    return () => { clearInterval(t); if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return (
    <div className="relative h-[180px] overflow-hidden">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
  );
}

/* ─── StatCard ──────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, loading }) {
  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-xl p-5 flex items-center gap-4 min-w-0 overflow-hidden">
      <div className="w-[52px] h-[52px] bg-[#111] border border-[#2A2A2A] rounded-lg flex items-center justify-center text-2xl text-[#C9A84C] shrink-0">
        <i className={`ti ${icon}`} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-[#666] uppercase tracking-[1.5px] font-semibold mb-1">{label}</div>
        <div className="font-['Bebas_Neue',sans-serif] text-[34px] text-white leading-none tracking-[1px]">
          {loading ? '—' : (value ?? '—')}
        </div>
        {sub && <div className="text-xs text-[#C9A84C] mt-1 font-semibold">{loading ? '' : sub}</div>}
      </div>
    </div>
  );
}

/* ─── ActionCard ────────────────────────────────────────────── */
function ActionCard({ label, icon, badge, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button" tabIndex={0}
      className={`bg-[#1A1A1A] border rounded-xl px-[14px] py-[14px] flex items-center gap-3 cursor-pointer transition-all duration-150 ${
        hov ? 'border-[#C9A84C33] bg-[#222]' : 'border-[#242424]'
      }`}
    >
      <div className="w-[34px] h-[34px] bg-[#0F0F0F] rounded-[7px] flex items-center justify-center text-lg text-[#C9A84C] shrink-0">
        <i className={`ti ${icon}`} />
      </div>
      <span className="text-[13px] font-bold text-white flex-1">{label}</span>
      {badge && <span className="text-[10px] bg-[#C9A84C] text-black px-[7px] py-[1px] rounded-[10px] font-bold">{badge}</span>}
      <i className="ti ti-chevron-right text-[13px] text-[#333]" />
    </div>
  );
}

/* ─── Spinner ───────────────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex items-center gap-[10px] text-[#555] text-[13px] py-8">
      <div className="w-5 h-5 border-2 border-[#222] border-t-[#C9A84C] rounded-full animate-spin shrink-0" />
      Cargando…
    </div>
  );
}

/* ─── AdminDashboard ────────────────────────────────────────── */
function AdminDashboard({ user, stats, loading, error }) {
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Administrador';
  const raw = stats?.raw || {};

  return (
    <div className="font-['Inter',sans-serif] text-white w-full">
      <div className="mb-6">
        <h1 className="font-['Bebas_Neue',sans-serif] text-[32px] tracking-[2px] text-white m-0 mb-1">
          Bienvenido, {firstName} 👋
        </h1>
        <p className="text-[13px] text-[#666] m-0">Aquí tienes un resumen general de tu barbería.</p>
      </div>

      {error && (
        <div className="bg-[#1A0A0A] border border-[#5A2020] rounded-lg px-4 py-3 text-[13px] text-[#E07070] mb-4 flex items-center gap-2">
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard icon="ti-calendar-event" label="Citas hoy" value={stats?.citasHoy ?? '—'} sub={new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'short' })} loading={loading} />
        <StatCard icon="ti-coin" label="Ingresos hoy" value={stats?.ingresosHoy ?? '—'} sub="Ventas completadas" loading={loading} />
        <StatCard icon="ti-user-plus" label="Nuevos clientes" value={stats?.newClientsToday ?? '—'} sub="Registrados hoy" loading={loading} />
        <StatCard icon="ti-users" label="Clientes totales" value={stats?.clientesActivos ?? '—'} sub="Total registrados" loading={loading} />
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-3 mb-3">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-xl p-5 min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[15px] font-bold text-white">Ingresos</span>
            <span className="text-[11px] text-[#555] bg-[#111] border border-[#222] rounded-[6px] px-3 py-1">Últimos 7 días</span>
          </div>
          {loading ? <Spinner /> : <LineChart salesByDay={raw.salesByDay || []} />}
        </div>

        <div className="bg-[#1A1A1A] border border-[#242424] rounded-xl p-5 min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[15px] font-bold text-white">Próximas citas</span>
            <span className="text-xs text-[#C9A84C] cursor-pointer font-semibold" onClick={() => navigate('/dashboard/citas')}>Ver todas</span>
          </div>
          {loading ? <Spinner /> : (raw.upcomingAppointments || []).length === 0 ? (
            <div className="text-[#444] text-[13px] py-4">No hay citas para hoy</div>
          ) : (raw.upcomingAppointments || []).map((a, i, arr) => {
            const hora = a.appointmentDate ? new Date(a.appointmentDate).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '—';
            const col = STATUS_COLORS[a.status] || STATUS_COLORS.PENDIENTE;
            const cliente = a.clienteId?.name || a.clientId?.name || 'Cliente';
            const servicio = a.serviceId?.name || 'Servicio';
            return (
              <div key={i} className={`flex items-center gap-3 py-[9px] ${i < arr.length - 1 ? 'border-b border-[#1E1E1E]' : ''}`}>
                <span className="text-sm font-bold text-[#C9A84C] min-w-[40px]">{hora}</span>
                <div className="w-8 h-8 rounded-full bg-[#C9A84C18] border border-[#C9A84C33] flex items-center justify-center text-[11px] text-[#C9A84C] font-bold shrink-0">
                  {cliente.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-white truncate">{cliente}</div>
                  <div className="text-[11px] text-[#666]">{servicio}</div>
                </div>
                <span
                  className="text-[10px] font-bold px-[9px] py-[3px] rounded-full whitespace-nowrap tracking-[0.4px] uppercase"
                  style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
                >
                  {a.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-xl p-5 min-w-0 overflow-hidden">
          <div className="text-[15px] font-bold text-white mb-4">Citas por estado</div>
          {loading ? <Spinner /> : <DonutChart data={raw.appointmentsByStatus || []} />}
          {!loading && (
            <div className="mt-4">
              {(raw.appointmentsByStatus || []).map(d => {
                const colors = ['#A08030', '#C9A84C', '#4A8A4A', '#8A2020'];
                const idx = ['PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO'].indexOf(d.label);
                return (
                  <div key={d.label} className="flex items-center gap-2 mb-[6px]">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[idx] || '#666' }} />
                    <span className="text-xs text-[#888] flex-1">{d.label}</span>
                    <span className="text-xs text-white font-bold">{d.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#1A1A1A] border border-[#242424] rounded-xl p-5 min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[15px] font-bold text-white">Productos más vendidos</span>
            <span className="text-xs text-[#C9A84C] cursor-pointer font-semibold" onClick={() => navigate('/dashboard/productos')}>Ver todos</span>
          </div>
          {loading ? <Spinner /> : (raw.topProducts || []).length === 0 ? (
            <div className="text-[#444] text-[13px]">Sin datos de productos</div>
          ) : (raw.topProducts || []).map((p, i) => (
            <div key={p._id || i} className="flex items-center gap-3 mb-3">
              <div className="w-[26px] h-[26px] rounded-full bg-[#C9A84C] flex items-center justify-center text-xs font-bold text-black shrink-0">{i + 1}</div>
              <div className="w-[38px] h-[38px] bg-[#111] border border-[#2A2A2A] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <i className="ti ti-package text-lg text-[#444]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white truncate">{p.name}</div>
                <div className="text-[11px] text-[#666]">{p.quantity ?? 0} unidades</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── UserDashboard ─────────────────────────────────────────── */
function UserDashboard({ user, stats, loading }) {
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  const futureAppts = stats?.raw?.futureAppointments ?? [];

  const ACTIONS = [
    { label: 'Reservar cita', icon: 'ti-calendar-plus', to: '/client/reservar', badge: 'Nuevo' },
    { label: 'Mis citas', icon: 'ti-calendar', to: '/client/citas' },
    { label: 'Productos', icon: 'ti-package', to: '/client/productos' },
    { label: 'Mi perfil', icon: 'ti-user-circle', to: '/client/perfil' },
    { label: 'Servicios', icon: 'ti-scissors', to: '/client/servicios' },
    { label: 'Reseñas', icon: 'ti-star', to: '/client/resenas' },
  ];

  return (
    <div className="font-['Inter',sans-serif] text-white">
      <div className="mb-6">
        <h1 className="font-['Bebas_Neue',sans-serif] text-[32px] tracking-[2px] text-white m-0 mb-1">
          Bienvenido, {firstName} 👋
        </h1>
        <p className="text-[13px] text-[#666] m-0">Aquí tienes un resumen de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[10px] mb-6">
        <StatCard icon="ti-calendar" label="Próxima cita" value={stats?.proximaCita ?? '—'} sub={stats?.proximaCitaHora ? `${stats.proximaCitaHora}${stats.proximaCitaBarbero ? ' · ' + stats.proximaCitaBarbero : ''}` : 'Sin citas pendientes'} loading={loading} />
        <StatCard icon="ti-history" label="Total citas" value={stats?.totalCitas ?? '—'} sub="Desde tu registro" loading={loading} />
        <StatCard icon="ti-star" label="Puntos acumulados" value={stats?.puntos ?? '—'} sub="Programa de lealtad" loading={loading} />
      </div>

      {futureAppts.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#242424] rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-white">Próximas citas</span>
            <span className="text-xs text-[#C9A84C] cursor-pointer font-semibold" onClick={() => navigate('/client/citas')}>Ver todas →</span>
          </div>
          {futureAppts.slice(0, 4).map((a, i) => {
            const fecha = a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
            const hora = a.appointmentDate ? new Date(a.appointmentDate).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : '';
            const col = STATUS_COLORS[a.status] || STATUS_COLORS.PENDIENTE;
            const isLast = i < futureAppts.slice(0, 4).length - 1;
            return (
              <div key={i} className={`flex items-center gap-[14px] py-[10px] ${isLast ? 'border-b border-[#222]' : ''}`}>
                <div className="min-w-[70px]">
                  <div className="text-[13px] font-bold text-[#C9A84C]">{fecha}</div>
                  {hora && <div className="text-[11px] text-[#555]">{hora}</div>}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white">{a.serviceId?.name || 'Servicio'}</div>
                  {a.barberId?.name && <div className="text-[11px] text-[#777]">con {a.barberId.name}</div>}
                </div>
                <span
                  className="text-[10px] font-bold px-[10px] py-[3px] rounded-full uppercase tracking-[0.5px] shrink-0"
                  style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
                >
                  {a.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] tracking-[2px] uppercase text-[#555] mb-[10px] font-bold">Acciones rápidas</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-[10px]">
        {ACTIONS.map(a => (
          <ActionCard key={a.to} {...a} onClick={() => navigate(a.to)} />
        ))}
      </div>
    </div>
  );
}

/* ─── DashboardHome ─────────────────────────────────────────── */
export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);
  const { stats, loading, error } = useDashboardStats();
  const role = user?.role || 'USER_ROLE';
  const isAdmin = role === 'ADMIN_ROLE';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      {isAdmin
        ? <AdminDashboard user={user} stats={stats} loading={loading} error={error} />
        : <UserDashboard user={user} stats={stats} loading={loading} />
      }
    </>
  );
}
