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

// Formatea una fecha como "Lun 16" o "Hoy"
const formatNextAppointmentDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${days[date.getDay()]} ${date.getDate()}`;
};

// Suma el total de ventas completadas
const calcMonthRevenue = (sales) => {
  const now = new Date();
  const completed = (sales || []).filter((s) => {
    const saleDate = new Date(s.createdAt);
    return (
      s.status === 'COMPLETADO' &&
      saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear()
    );
  });
  const total = completed.reduce((acc, s) => acc + (s.total || 0), 0);
  return `Q${total.toLocaleString('es-GT', { minimumFractionDigits: 0 })}`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const useDashboardStats = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role;

  useEffect(() => {
    if (!token || !role) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (role === 'ADMIN_ROLE') {
          await loadAdminStats();
        } else if (role === 'USER_ROLE') {
          await loadUserStats();
        }
      } catch (err) {
        setError(err.message || 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, role]);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const loadAdminStats = async () => {
    const todayISO = new Date().toISOString().split('T')[0]; // "2025-06-11"

    const [appointmentsToday, clients, barbers, sales] = await Promise.all([
      fetchAppointmentsByDate(token, todayISO).catch(() => ({ total: 0 })),
      fetchClients(token).catch(() => ({ data: [] })),
      fetchBarbers(token).catch(() => ({ data: [] })),
      fetchSales(token).catch(() => ({ sales: [] })),
    ]);

    setStats({
      citasHoy: appointmentsToday.total ?? 0,
      clientesActivos: clients.data?.length ?? 0,
      ingresosMes: calcMonthRevenue(sales.sales),
      totalBarberos: barbers.data?.length ?? 0,
      // Data cruda por si la quieres usar en tablas luego
      raw: {
        appointmentsToday: appointmentsToday.data ?? [],
        clients: clients.data ?? [],
        barbers: barbers.data ?? [],
        sales: sales.sales ?? [],
      },
    });
  };

  // ── User ───────────────────────────────────────────────────────────────────
  const loadUserStats = async () => {
    // El clientId está en el user del store (viene del JWT / perfil)
    const clientId = user?.clientId || user?.uid || user?._id;

    if (!clientId) {
      // Si no hay clientId todavía, igual mostramos algo
      setStats({
        proximaCita: '—',
        proximaCitaHora: null,
        totalCitas: 0,
        puntos: 0,
        raw: { appointments: [] },
      });
      return;
    }

    const [appointments, pointsData] = await Promise.all([
      fetchAppointmentsByClient(token, clientId).catch(() => ({ total: 0, data: [] })),
      fetchClientPoints(token, clientId).catch(() => ({ data: { points: 0 } })),
    ]);

    // Próxima cita = la más cercana al futuro que no esté cancelada
    const futureAppointments = (appointments.data ?? [])
      .filter((a) => new Date(a.appointmentDate) >= new Date() && a.status !== 'CANCELADO')
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    const next = futureAppointments[0] ?? null;
    const nextHora = next
      ? new Date(next.appointmentDate).toLocaleTimeString('es-GT', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    setStats({
      proximaCita: formatNextAppointmentDate(next?.appointmentDate),
      proximaCitaHora: nextHora,
      proximaCitaServicio: next?.serviceId?.name ?? null,
      proximaCitaBarbero: next?.barberId?.name ?? null,
      totalCitas: appointments.total ?? 0,
      puntos: pointsData.data?.points ?? 0,
      raw: {
        appointments: appointments.data ?? [],
        futureAppointments,
      },
    });
  };

  return { stats, loading, error };
};
