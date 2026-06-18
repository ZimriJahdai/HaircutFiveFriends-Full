import { useState } from 'react';
import { useServices } from '../hooks/useServices.js';
import { ServiceCard } from '../components/ServiceCard.jsx';
import { ServiceSearch } from '../components/ServiceSearch.jsx';
import { ServiceHeader } from '../components/ServiceHeader.jsx';
import { ServicesEmptyState } from '../components/ServicesEmptyState.jsx';
import NavbarClient from '../../client/components/NavbarClient.jsx';

export const ServicesClient = () => {
  const { services, loading, error, refetchServices } = useServices();
  const [query, setQuery] = useState('');

  const activeServices = services.filter(s => s.status === 'activo');
  const filtered = activeServices.filter(
    s => !query.trim() || s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const getVariant = () => {
    if (loading) return 'loading';
    if (activeServices.length === 0) return 'empty';
    if (query && filtered.length === 0) return 'no-results';
    return null;
  };

  const variant = getVariant();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      <NavbarClient />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <ServiceHeader />
        <div className="h-[1px] bg-[#00D2C4]/20 mb-8" />
        {error && (
          <div className="bg-[#2A1515] border border-[#5A2020] rounded-xl px-4 py-3 text-[13px] text-[#E88] flex items-center gap-3 mb-8">
            <i className="ti ti-alert-circle text-lg" aria-hidden="true" />{error}
            <button type="button" onClick={refetchServices} className="ml-auto text-[#C9A84C] hover:underline text-[12px]">Reintentar</button>
          </div>
        )}
        {!loading && activeServices.length > 0 && (
          <ServiceSearch query={query} onChange={setQuery} total={activeServices.length} filtered={filtered.length} />
        )}
        {variant ? (
          <ServicesEmptyState variant={variant} onAction={() => setQuery('')} query={query} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(service => <ServiceCard key={service._id} service={service} />)}
          </div>
        )}
      </div>
    </div>
  );
};
