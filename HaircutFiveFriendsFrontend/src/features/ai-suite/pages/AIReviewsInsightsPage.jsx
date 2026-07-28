import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { axiosAI } from '../../../shared/api/aiHaircut.js';
import { axiosAdmin } from '../../../shared/api/api.js';

export function AIReviewsInsightsPage() {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const loadBarbers = async () => {
      try {
        const res = await axiosAdmin.get('/barbers');
        const data = res.data?.data || [];
        setBarbers(data);
        if (data[0]?._id) setSelectedBarber(data[0]._id);
      } catch {
        toast.error('No se pudo cargar la lista de barberos.');
      }
    };
    loadBarbers();
  }, []);

  const selected = useMemo(() => barbers.find((barber) => barber._id === selectedBarber), [barbers, selectedBarber]);

  const runAnalysis = async () => {
    if (!selectedBarber) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await axiosAI.get(`/api/reviews/analyze/${selectedBarber}`);
      setAnalysis(res.data?.analysis || res.data || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo ejecutar el análisis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <NavbarClient />

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <header className="mb-6">
          <h1 className="font-['Bebas_Neue'] text-4xl tracking-wider text-white">Análisis IA de reseñas</h1>
          <p className="text-sm text-zinc-400 mt-1">Selecciona un barbero y genera insights automáticos.</p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#111] p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-zinc-500 mb-2 block">Barbero</span>
              <select
                value={selectedBarber}
                onChange={(event) => setSelectedBarber(event.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-[#00D2C4]/60"
              >
                {barbers.map((barber) => (
                  <option key={barber._id} value={barber._id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading || !selectedBarber}
              className="px-5 py-3 rounded-xl bg-[#00D2C4] text-[#052a26] font-bold disabled:bg-white/10 disabled:text-zinc-500"
            >
              {loading ? 'Analizando…' : 'Analizar'}
            </button>
          </div>

          {selected && (
            <p className="text-sm text-zinc-400">Analizando reseñas de: <span className="text-zinc-100 font-semibold">{selected.name}</span></p>
          )}

          <div className="rounded-xl border border-white/10 bg-black/30 p-4 min-h-[180px]">
            {!analysis ? (
              <p className="text-sm text-zinc-500">No hay análisis generado todavía.</p>
            ) : typeof analysis === 'string' ? (
              <p className="text-sm leading-7 text-zinc-200 whitespace-pre-wrap">{analysis}</p>
            ) : (
              <pre className="text-xs text-zinc-300 overflow-auto">{JSON.stringify(analysis, null, 2)}</pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
