import { useEffect, useMemo } from 'react';
import { useHaircutStore } from '../../haircut/store/useHaircutStore';
import NavbarClient from '../../client/components/NavbarClient.jsx';

const Galeria = () => {
  const { haircut: haircuts, loading, error, getHaircut } = useHaircutStore();

  useEffect(() => {
    getHaircut();
  }, [getHaircut]);

  const cards = useMemo(() => {
    if (!haircuts) return [];
    return haircuts;
  }, [haircuts]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <NavbarClient />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-white mb-3">
            Estilos
          </h1>
          <p className="max-w-2xl text-sm text-[#A3A3A3] leading-6">
            Explora nuestra galería de cortes y estilos. Selecciona el que más te guste para inspirar tu próxima visita.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[#5A2020] bg-[#1D0D0F] px-5 py-4 text-sm text-[#F5B6B6]">
            {error}
          </div>
        ) : loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#2A2A2A] bg-[#111] text-sm text-[#A3A3A3]">
            Cargando estilos…
          </div>
        ) : cards.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[#2A2A2A] bg-[#111] text-center text-sm text-[#A3A3A3]">
            <span className="text-xl text-[#E8E4DC] font-semibold mb-2">No hay estilos disponibles</span>
            <span>Vuelve pronto para ver más cortes y recomendaciones.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {cards.map((haircut) => (
              <article
                key={haircut._id}
                className="rounded-3xl overflow-hidden border border-[#222] bg-[#111] shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-[#00D2C4]/40"
              >
                <div className="h-[250px] bg-[#090909] overflow-hidden">
                  {haircut.imageRef ? (
                    <img
                      src={haircut.imageRef}
                      alt={haircut.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#5A5A5A] text-5xl">
                      <i className="ti ti-scissors" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h2 className="text-xl font-semibold text-white">{haircut.name}</h2>
                    <span className="rounded-full border border-[#00D2C4]/20 bg-[#00D2C4]/10 px-3 py-1 text-[11px] uppercase tracking-[1px] text-[#00D2C4]">
                      {haircut.faceTypeRecommended === 'CUALQUIERA'
                        ? 'Cualquiera'
                        : haircut.faceTypeRecommended?.charAt(0).toUpperCase() + haircut.faceTypeRecommended?.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-[#B9B9B9]">{haircut.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Galeria;
