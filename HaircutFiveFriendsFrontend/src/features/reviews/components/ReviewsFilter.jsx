export const ReviewsFilter = ({
  filter,
  setFilter,
  total,
}) => {
  const options = [
    ['todos', 'Todas'],
    ['barbero', 'Por barbero'],
    ['servicio', 'Por servicio'],
  ];

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid',
            cursor: 'pointer',
            fontSize: '12px',
            background: filter === key ? '#C9A84C18' : 'transparent',
            borderColor: filter === key ? '#C9A84C44' : '#2A2A2A',
            color: filter === key ? '#C9A84C' : '#555',
          }}
        >
          {label}
        </button>
      ))}
      <span style={{ marginLeft: 'auto', color: '#555', fontSize: '12px', alignSelf: 'center' }}>
        {total} reseñas
      </span>
    </div>
  );
};
