export const ProductAlerts = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div className="mb-4 space-y-2">
      {error && (
        <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
          <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#152A15] border border-[#205A20] rounded-lg px-3.5 py-2.5 text-[12px] text-[#8E8] flex items-center gap-2">
          <i className="ti ti-check text-lg" aria-hidden="true" />
          {success}
        </div>
      )}
    </div>
  );
};