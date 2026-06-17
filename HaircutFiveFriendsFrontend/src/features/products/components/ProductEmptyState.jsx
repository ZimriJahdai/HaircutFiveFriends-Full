export const ProductEmptyState = ({ icon = 'ti-package', title, subtitle, actionLabel, onAction }) => (
  <div className="flex flex-col items-center gap-3.5 py-16 text-[#5A5A5A] text-[14px] text-center">
    <i className={`ti ${icon} text-5xl text-[#333]`} aria-hidden="true" />
    <h3 className="m-0 text-[#E8E4DC] text-[16px] font-semibold">{title}</h3>
    <p className="m-0 text-[#5A5A5A] text-[13px] max-w-[420px]">{subtitle}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-md px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors mt-2 focus:outline-none"
        onClick={onAction}
      >
        <i className="ti ti-plus text-[16px]" aria-hidden="true" />
        {actionLabel}
      </button>
    )}
  </div>
);