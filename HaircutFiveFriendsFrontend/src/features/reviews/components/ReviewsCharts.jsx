import { useEffect, useRef, useState } from 'react';

const useReviewCharts = (reviews = []) => {
  const scoreDistribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: reviews.filter((r) => r.score === score).length,
  }));

  const barberMap = {};
  reviews.filter((r) => r.barberoId).forEach((review) => {
    const id = review.barberoId?._id || review.barberoId;
    const name = review.barberoId?.name || 'Desconocido';
    if (!barberMap[id]) barberMap[id] = { name, scores: [] };
    barberMap[id].scores.push(review.score);
  });
  const barberAverages = Object.values(barberMap)
    .map((b) => ({ name: b.name, avg: (b.scores.reduce((a, b) => a + b, 0) / b.scores.length).toFixed(1), count: b.scores.length }))
    .sort((a, b) => b.avg - a.avg);

  const serviceMap = {};
  reviews.filter((r) => r.servicioId).forEach((review) => {
    const id = review.servicioId?._id || review.servicioId;
    const name = review.servicioId?.name || 'Desconocido';
    if (!serviceMap[id]) serviceMap[id] = { name, scores: [] };
    serviceMap[id].scores.push(review.score);
  });
  const serviceAverages = Object.values(serviceMap)
    .map((s) => ({ name: s.name, avg: (s.scores.reduce((a, b) => a + b, 0) / s.scores.length).toFixed(1), count: s.scores.length }))
    .sort((a, b) => b.avg - a.avg);

  return { scoreDistribution, barberAverages, serviceAverages };
};

const loadChart = () => {
  if (window.Chart) return Promise.resolve(window.Chart);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => resolve(window.Chart);
    document.head.appendChild(script);
  });
};

function AvgChartCard({ title, emptyMsg, data }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.offsetWidth);
    const observer = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(e.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    let active = true;
    loadChart().then((Chart) => {
      if (!active) return;
      if (instanceRef.current) instanceRef.current.destroy();
      instanceRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: data.map((d) => d.name),
          datasets: [{
            label: 'Promedio',
            data: data.map((d) => Number(d.avg)),
            backgroundColor: '#C9A84C',
            borderRadius: 4,
            borderSkipped: false,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { min: 0, max: 5, ticks: { color: '#777', font: { size: 12 } }, grid: { color: '#1E1E1E' } },
            y: { ticks: { color: '#AAA', font: { size: 12 } }, grid: { color: '#1A1A1A' } },
          },
        },
      });
    });
    return () => { active = false; if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null; } };
  }, [data, containerWidth]);

  return (
    <div ref={containerRef} className="bg-[#111] border border-[#1E1E1E] rounded-[10px] p-5 overflow-hidden">
      <p className="m-0 mb-4 text-[10px] text-[#5A5A5A] tracking-[2px] uppercase">{title}</p>
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-[#333] text-[13px]">{emptyMsg}</div>
      ) : (
        <div className="relative overflow-hidden" style={{ height: Math.max(200, data.length * 44 + 40) + 'px' }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}

export const ReviewsCharts = ({ reviews, filterType = 'todos' }) => {
  const distCanvasRef = useRef(null);
  const distInstanceRef = useRef(null);
  const distContainerRef = useRef(null);
  const [distWidth, setDistWidth] = useState(0);

  useEffect(() => {
    const el = distContainerRef.current;
    if (!el) return;
    setDistWidth(el.offsetWidth);
    const observer = new ResizeObserver((entries) => {
      for (const e of entries) setDistWidth(e.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scoreDistribution, barberAverages, serviceAverages } = useReviewCharts(reviews);

  const showBarbers = filterType === 'todos' || filterType === 'barbero';
  const showServices = filterType === 'todos' || filterType === 'servicio';

  useEffect(() => {
    if (!distCanvasRef.current) return;
    let active = true;
    loadChart().then((Chart) => {
      if (!active) return;
      if (distInstanceRef.current) distInstanceRef.current.destroy();
      distInstanceRef.current = new Chart(distCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
          datasets: [{
            label: 'Reseñas',
            data: scoreDistribution.map((item) => item.count),
            backgroundColor: ['#5A1A1A', '#8A4020', '#8A6A10', '#A08030', '#C9A84C'],
            borderRadius: 4,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#777', font: { size: 12 } }, grid: { color: '#1A1A1A' } },
            y: { beginAtZero: true, ticks: { color: '#777', stepSize: 1 }, grid: { color: '#1E1E1E' } },
          },
        },
      });
    });
    return () => { active = false; if (distInstanceRef.current) { distInstanceRef.current.destroy(); distInstanceRef.current = null; } };
  }, [scoreDistribution, distWidth]);

  return (
    <div className="flex flex-col gap-[14px] mb-7">
      <div className="grid grid-cols-2 gap-[14px]">
        <div ref={distContainerRef} className="bg-[#111] border border-[#1E1E1E] rounded-[10px] p-5 overflow-hidden">
          <p className="m-0 mb-4 text-[10px] text-[#5A5A5A] tracking-[2px] uppercase">Distribución de puntuaciones</p>
          <div className="h-[200px] relative overflow-hidden">
            <canvas ref={distCanvasRef} className="w-full h-full" />
          </div>
        </div>
        {showBarbers && (
          <AvgChartCard title="Promedio por barbero" emptyMsg="Sin datos de barberos" data={barberAverages} />
        )}
        {showServices && !showBarbers && (
          <AvgChartCard title="Promedio por servicio" emptyMsg="Sin datos de servicios" data={serviceAverages} />
        )}
      </div>
      {showBarbers && showServices && serviceAverages.length > 0 && (
        <AvgChartCard title="Promedio por servicio" emptyMsg="Sin datos de servicios" data={serviceAverages} />
      )}
    </div>
  );
};
