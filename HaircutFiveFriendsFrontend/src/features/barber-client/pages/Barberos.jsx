import { useState, useMemo, useEffect } from 'react';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { BarberSearch } from '../components/BarberSearch.jsx';
import { BarberosHeader } from '../components/BarberosHeader.jsx';
import { BarberosEmptyState } from '../components/BarberosEmptyState.jsx';
import { BarberSection } from '../components/BarberSection.jsx';
import { useBarbers } from '../hooks/useBarbers.js';
import { getAllReviews } from '../../../shared/api/review';

const useReviewStats = (barbers) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReviews()
      .then((res) => setReviews(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statsMap = useMemo(() => {
    const map = {};
    for (const barber of barbers) {
      const barberId = barber._id || barber.id;
      const barberReviews = reviews.filter(
        (r) => (r.barberoId?._id || r.barberoId) === barberId
      );
      const total = barberReviews.length;
      const avg = total
        ? (barberReviews.reduce((s, r) => s + r.score, 0) / total).toFixed(1)
        : null;
      map[barberId] = { total, average: avg };
    }
    return map;
  }, [reviews, barbers]);

  return { statsMap, loading };
};

export const Barberos = () => {
  const { barbers, loading, error, refetch } = useBarbers();
  const { statsMap, loading: reviewsLoading } = useReviewStats(barbers);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? barbers.filter((b) => b.name?.toLowerCase().includes(q)) : barbers;
  }, [barbers, query]);

  const getVariant = () => {
    if (loading) return 'loading';
    if (barbers.length === 0) return 'empty';
    if (query && filtered.length === 0) return 'no-results';
    return null;
  };

  const variant = getVariant();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <BarberosHeader />

        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />

        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[13px] text-[#E88] flex items-center gap-3 mb-8">
            <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
            {error}
            <button type="button" onClick={refetch} className="ml-auto text-[#C9A84C] hover:underline text-[12px] focus:outline-none">
              Reintentar
            </button>
          </div>
        )}

        {!loading && barbers.length > 0 && (
          <BarberSearch query={query} onChange={setQuery} total={barbers.length} filtered={filtered.length} />
        )}

        {variant ? (
          <BarberosEmptyState variant={variant} onAction={() => setQuery('')} query={query} />
        ) : (
          <>
            <BarberSection title="Disponibles" icon="ti ti-circle-check" barbers={filtered.filter((b) => b.status)} active statsMap={statsMap} />
            <BarberSection title="No disponibles" icon="ti ti-clock" barbers={filtered.filter((b) => !b.status)} active={false} statsMap={statsMap} />
          </>
        )}
      </main>
    </div>
  );
};
