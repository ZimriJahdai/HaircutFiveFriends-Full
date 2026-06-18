export const ReviewEmptyState = ({
  icon = 'ti-message-off',
  message = 'No hay reseñas disponibles.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <i className={`ti ${icon} text-5xl text-[#333]`} />
      <p className="m-0 text-[#5A5A5A] text-[14px] leading-relaxed">
        {message}
      </p>
    </div>
  );
};
