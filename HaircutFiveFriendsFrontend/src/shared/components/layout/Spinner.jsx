export const Spinner = ({ label = 'Cargando...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <div className="spinner" style={{ marginBottom: '1rem' }} />
      <span>{label}</span>
      <style>{`
        .spinner {
          width: 48px;
          height: 48px;
          border: 6px solid rgba(0, 0, 0, 0.1);
          border-top-color: #1d4ed8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
