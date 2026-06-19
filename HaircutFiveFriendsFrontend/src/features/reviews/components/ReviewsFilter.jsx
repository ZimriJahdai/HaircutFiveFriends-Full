export const ReviewsFilter = ({ filter, setFilter, total }) => {
  const options = [
    ['todos', 'Todas'],
    ['barbero', 'Por barbero'],
    ['servicio', 'Por servicio'],
  ];

  return (
    <div className="flex gap-2 mb-4">
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          className={`px-[14px] py-[6px] rounded-[6px] border cursor-pointer text-xs transition-colors ${
            filter === key
              ? 'bg-[#C9A84C18] border-[#C9A84C44] text-[#C9A84C]'
              : 'bg-transparent border-[#2A2A2A] text-[#555]'
          }`}
        >
          {label}
        </button>
      ))}
      <span className="ml-auto text-[#555] text-xs self-center">
        {total} reseñas
      </span>
    </div>
  );
};
