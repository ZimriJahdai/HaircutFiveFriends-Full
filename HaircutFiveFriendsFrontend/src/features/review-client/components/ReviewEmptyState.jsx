export const ReviewEmptyState = ({
  icon = 'ti-message-off',
  message = 'No hay reseñas disponibles.',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}
    >
      <i
        className={`ti ${icon}`}
        style={{
          fontSize: '48px',
          color: '#333',
        }}
      />

      <p
        style={{
          margin: 0,
          color: '#5A5A5A',
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
    </div>
  );
};
