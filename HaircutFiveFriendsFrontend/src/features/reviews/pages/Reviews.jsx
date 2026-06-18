import { useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useReviewStore } from '../store/useReviewStore';
import { AdminView } from '../views/AdminView';
import { ClientView } from '../views/ClientView';

export const Reviews = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN_ROLE';
  const { reviews, loading, error, getReviews } = useReviewStore();

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  if (!isAdmin) {
    return <ClientView reviews={reviews} loading={loading} error={error} refetch={getReviews} />;
  }

  return (
    <div className="font-sans text-[#E8E4DC] w-full">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '38px', letterSpacing: '3px', color: '#E8E4DC', margin: 0 }}>
          Reseñas
        </h1>
        <p style={{ color: '#5A5A5A', fontSize: '13px', marginTop: '5px' }}>
          Vista general de las calificaciones recibidas.
        </p>
      </div>

      <div style={{ height: '1px', background: '#C9A84C33', marginBottom: '1.5rem' }} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#555' }}>
          Cargando reseñas...
        </div>
      ) : (
        <AdminView reviews={reviews} loading={loading} error={error} />
      )}
    </div>
  );
};
