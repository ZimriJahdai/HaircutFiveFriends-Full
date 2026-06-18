import { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useServiceStore } from '../store/useServiceStore.js';
import { AdminView } from '../views/AdminView.jsx';
import { ClientView } from '../views/ClientView.jsx';

export const Services = () => {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'ADMIN_ROLE';
  const { services, loading, error, getServices } = useServiceStore();

  useEffect(() => { getServices(); }, [getServices]);

  const title = 'Servicios';
  const subtitle = isAdmin
    ? 'Gestiona el catálogo de servicios de la barbería.'
    : 'Descubre todo lo que tenemos para ti en Five Friends.';

  return (
    <div className="font-sans text-[#E8E4DC] w-full h-full">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      {isAdmin ? (
        <>
          <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#E8E4DC] m-0 mb-1 leading-none">{title}</h1>
              <p className="text-[13px] text-[#5A5A5A] m-0">{subtitle}</p>
            </div>
          </div>
          <div className="h-[1px] bg-[#C9A84C]/20 mb-4" />
          <AdminView services={services} loading={loading} error={error} getServices={getServices} />
        </>
      ) : (
        <ClientView services={services} loading={loading} error={error} refetch={getServices} />
      )}
    </div>
  );
};
