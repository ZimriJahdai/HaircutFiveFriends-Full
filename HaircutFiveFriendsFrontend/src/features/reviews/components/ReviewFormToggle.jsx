export const ReviewFormToggle = ({ showForm, onClick, success }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-end">
        <button
          onClick={onClick}
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#00D2C4] text-[#00D2C4] hover:text-[#0A0A0A] border border-[#00D2C4] rounded-xl px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
        >
          <i className={`ti ${showForm ? 'ti-x' : 'ti-pencil'}`} />
          {showForm ? 'Cancelar' : 'Escribir reseña'}
        </button>
      </div>

      {success && (
        <div className="bg-[#152A15] border border-[#205A20] text-[#8E8] px-3 py-2.5 rounded-xl text-[12px] mt-4 flex items-center gap-2">
          <i className="ti ti-check" /> {success}
        </div>
      )}
    </div>
  );
};
