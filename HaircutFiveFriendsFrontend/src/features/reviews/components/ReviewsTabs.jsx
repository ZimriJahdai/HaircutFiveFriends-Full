export const ReviewsTabs = ({ tab, setTab }) => {
  const tabs = [
    { key: 'todas', label: 'Todas las reseñas' },
    { key: 'mias', label: 'Mis reseñas' },
  ];

  return (
    <div className="flex gap-0.5 mb-5 bg-[#111] border border-[#1E1E1E] rounded-xl p-1">
      {tabs.map((item) => (
        <button
          key={item.key}
          onClick={() => setTab(item.key)}
          className={`flex-1 py-1.5 px-3 border-none rounded-lg cursor-pointer text-[12px] font-medium transition-colors ${
            tab === item.key
              ? 'bg-[#1A1A1A] text-[#E8E4DC]'
              : 'bg-transparent text-[#555] hover:text-[#E8E4DC]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
