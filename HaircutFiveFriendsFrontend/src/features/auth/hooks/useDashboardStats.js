import { useState, useEffect } from 'react';
import { useAuthStore } from './../store/authStore.js';
import {
  fetchAppointmentsByDate,
  fetchClients,
  fetchBarbers,
  fetchSales,
  fetchAppointmentsByClient,
  fetchClientPoints,
} from './../../../shared/api/dashboardService.js';
import { axiosAdmin } from '../../../shared/api/api.js';

const calcMonthRevenue = (sales) => {
  const now = new Date();
  const completed = (sales || []).filter((s) => {
    const d = new Date(s.createdAt);
    return s.status === 'COMPLETADO' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const total = completed.reduce((acc, s) => acc + (s.total || 0), 0);
  return `Q${total.toLocaleString('es-GT', { minimumFractionDigits: 0 })}`;
};

const calcTodayRevenue = (sales) => {
  const today = new Date().toISOString().split('T')[0];
  const total = (sales || [])
    .filter(s => s.status === 'COMPLETADO' && s.createdAt?.startsWith(today))
    .reduce((acc, s) => acc + (s.total || 0), 0);
  return `Q${total.toLocaleString('es-GT', { minimumFractionDigits: 0 })}`;
};

const formatNextAppointmentDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  return `${days[date.getDay()]} ${date.getDate()}`;
};

export const useDashboardStats = () => {
  const token = useAuthStore((state) => state.token);
  const user  = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const role = user?.role;

  useEffect(() => {
    if (!token || !role) return;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        if (role === 'ADMIN_ROLE') await loadAdminStats();
        else if (role === 'USER_ROLE') await loadUserStats();
      } catch (err) {
        setError(err.message || 'Error al cargar estadísticas');
      } finally { setLoading(false); }
    };
    load();
  }, [token, role]);

  const loadAdminStats = async () => {
    const todayISO = new Date().toISOString().split('T')[0];

    const [appointmentsToday, clients, barbers, sales, products] = await Promise.all([
      fetchAppointmentsByDate(token, todayISO).catch(() => ({ total: 0, data: [] })),
      fetchClients(token).catch(() => ({ data: [] })),
      fetchBarbers(token).catch(() => ({ data: [] })),
      fetchSales(token).catch(() => ({ sales: [] })),
      axiosAdmin.get('/products').then(r => r.data).catch(() => ({ data: [] })),
    ]);

    const salesArr = sales.sales ?? [];
    const clientsArr = clients.data ?? [];
    const productsArr = products.data ?? [];
    const appointmentsTodayArr = appointmentsToday.data ?? [];

    // Nuevos clientes hoy
    const newClientsToday = clientsArr.filter(c => {
      const d = new Date(c.createdAt);
      return d.toISOString().startsWith(todayISO);
    }).length;

    // Ingresos por día últimos 7 días
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const salesByDay = last7Days.map(day => ({
      date: day,
      label: new Date(day + 'T12:00:00').toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric' }),
      total: salesArr.filter(s => s.status === 'COMPLETADO' && s.createdAt?.startsWith(day)).reduce((a, s) => a + (s.total || 0), 0),
    }));

    // Próximas citas ordenadas
    const upcomingAppointments = appointmentsTodayArr
      .filter(a => a.status !== 'CANCELADO')
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 6);

    // Top productos por detalle de ventas
    let topProducts = [];
    try {
      const detailRes = await axiosAdmin.get('/detail-sales').then(r => r.data).catch(() => ({ details: [] }));
      const productSales = {};
      (detailRes.details || [])
        .filter(d => d.detailType === 'PRODUCT')
        .forEach(d => {
          const pid = d.referenceId?.toString() || d.productId?.toString();
          if (pid) productSales[pid] = (productSales[pid] || 0) + (d.quantity || 1);
        });
      const productMap = {};
      productsArr.forEach(p => { productMap[p.id || p._id] = p; });
      topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id, qty]) => ({
          ...(productMap[id] || { name: 'Producto', image: null }),
          quantity: qty,
        }));
      if (!topProducts.length) topProducts = productsArr.slice(0, 4);
    } catch (_) {
      topProducts = productsArr.slice(0, 4);
    }

    // Distribución citas por estado
    const statuses = ['PENDIENTE','CONFIRMADO','COMPLETADO','CANCELADO'];
    const appointmentsByStatus = statuses.map(s => ({
      label: s,
      count: appointmentsTodayArr.filter(a => a.status === s).length,
    }));

    setStats({
      citasHoy: appointmentsToday.total ?? 0,
      clientesActivos: clientsArr.length,
      ingresosMes: calcMonthRevenue(salesArr),
      ingresosHoy: calcTodayRevenue(salesArr),
      totalBarberos: barbers.data?.length ?? 0,
      newClientsToday,
      raw: {
        appointmentsToday: appointmentsTodayArr,
        upcomingAppointments,
        clients: clientsArr,
        barbers: barbers.data ?? [],
        sales: salesArr,
        salesByDay,
        topProducts,
        appointmentsByStatus,
      },
    });
  };

  const loadUserStats = async () => {
    const clientId = user?.clientId || user?.uid || user?._id;
    if (!clientId) {
      setStats({ proximaCita: '—', proximaCitaHora: null, totalCitas: 0, puntos: 0, raw: { appointments: [], futureAppointments: [] } });
      return;
    }
    const [appointments, pointsData] = await Promise.all([
      fetchAppointmentsByClient(token, clientId).catch(() => ({ total: 0, data: [] })),
      fetchClientPoints(token, clientId).catch(() => ({ data: { points: 0 } })),
    ]);
    const futureAppointments = (appointments.data ?? [])
      .filter(a => new Date(a.appointmentDate) >= new Date() && a.status !== 'CANCELADO')
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    const next = futureAppointments[0] ?? null;
    setStats({
      proximaCita: formatNextAppointmentDate(next?.appointmentDate),
      proximaCitaHora: next ? new Date(next.appointmentDate).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : null,
      proximaCitaServicio: next?.serviceId?.name ?? null,
      proximaCitaBarbero: next?.barberId?.name ?? null,
      totalCitas: appointments.total ?? 0,
      puntos: pointsData.data?.points ?? 0,
      raw: { appointments: appointments.data ?? [], futureAppointments },
    });
  };

  return { stats, loading, error };
};
