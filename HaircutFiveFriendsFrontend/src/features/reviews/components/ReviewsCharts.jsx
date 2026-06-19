import { useEffect, useRef } from 'react';

const useReviewCharts = (reviews = []) => {
  const scoreDistribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: reviews.filter((r) => r.score === score).length,
  }));

  const barberMap = {};
  reviews
    .filter((r) => r.barberoId)
    .forEach((review) => {
      const id = review.barberoId?._id || review.barberoId;
      const name = review.barberoId?.name || 'Desconocido';
      if (!barberMap[id]) barberMap[id] = { name, scores: [] };
      barberMap[id].scores.push(review.score);
    });

  const barberAverages = Object.values(barberMap)
    .map((b) => ({
      name: b.name,
      avg: (b.scores.reduce((a, b) => a + b, 0) / b.scores.length).toFixed(1),
      count: b.scores.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  return { scoreDistribution, barberAverages };
};

export const ReviewsCharts = ({ reviews }) => {
  const chartRef = useRef(null);
  const barChartRef = useRef(null);
  const chartInstance = useRef(null);
  const barChartInstance = useRef(null);
  const { scoreDistribution, barberAverages } = useReviewCharts(reviews);

  useEffect(() => {
    if (!chartRef.current) return;
    const createChart = () => {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
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
    };
    if (window.Chart) {
      createChart();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
      script.onload = createChart;
      document.head.appendChild(script);
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [reviews, scoreDistribution]);

  useEffect(() => {
    if (!barChartRef.current || barberAverages.length === 0) return;
    const createBarChart = () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      barChartInstance.current = new window.Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: barberAverages.map((b) => b.name),
          datasets: [{
            label: 'Promedio',
            data: barberAverages.map((b) => Number(b.avg)),
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
    };
    if (window.Chart) {
      createBarChart();
    } else {
      const timer = setInterval(() => {
        if (window.Chart) { clearInterval(timer); createBarChart(); }
      }, 100);
      return () => clearInterval(timer);
    }
    return () => { if (barChartInstance.current) barChartInstance.current.destroy(); };
  }, [reviews, barberAverages]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '1.75rem' }}>
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '1.25rem' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '10px', color: '#5A5A5A', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Distribución de puntuaciones
        </p>
        <div style={{ height: '200px', position: 'relative' }}>
          <canvas ref={chartRef} />
        </div>
      </div>
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '10px', padding: '1.25rem' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '10px', color: '#5A5A5A', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Promedio por barbero
        </p>
        {barberAverages.length === 0 ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '13px' }}>
            Sin datos de barberos
          </div>
        ) : (
          <div style={{ height: Math.max(200, barberAverages.length * 44 + 40) + 'px', position: 'relative' }}>
            <canvas ref={barChartRef} />
          </div>
        )}
      </div>
    </div>
  );
};
