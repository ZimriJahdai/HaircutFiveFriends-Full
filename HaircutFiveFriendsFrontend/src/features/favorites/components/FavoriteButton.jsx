import { useFavorites } from '../hooks/useFavorites';

/**
 * FavoriteButton — botón de corazón que alterna el favorito de un barbero.
 * Visualmente prominente: fondo semiopaco siempre visible, animación de escala al activar.
 */
export const FavoriteButton = ({ id, className = '' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(id);
      }}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={[
        'flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200 focus:outline-none active:scale-90',
        active
          ? 'bg-[#00D2C4] border-[#00D2C4] text-[#0A0A0A] shadow-[0_0_12px_rgba(0,210,196,0.5)]'
          : 'bg-[#0A0A0A]/70 border-white/20 text-white hover:border-[#00D2C4] hover:text-[#00D2C4] hover:bg-[#0A0A0A]/90 backdrop-blur-sm',
        className,
      ].join(' ')}
    >
      <i
        className={`${active ? 'ti ti-heart-filled' : 'ti ti-heart'} text-[16px]`}
        aria-hidden="true"
      />
    </button>
  );
};
