
/**
 * ConfirmModal — A premium, themed confirmation modal dialog.
 * Matches the dark/neon cyan aesthetic of the application.
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger' // 'danger' (red accents) | 'info' (cyan accents)
}) => {
  if (!isOpen) return null;

  const accentColor = variant === 'danger' ? '#FF5555' : '#00D2C4';
  const iconClass = variant === 'danger' ? 'ti-trash text-[#FF5555]' : 'ti-alert-circle text-[#00D2C4]';
  const confirmBtnClass = variant === 'danger'
    ? 'bg-[#FF5555] hover:bg-[#FF7777] text-white'
    : 'bg-[#00D2C4] hover:bg-[#00E5D5] text-[#0A0A0A]';

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#111111] border border-[#222222] hover:border-[#333333] rounded-2xl w-full max-w-[400px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Header & Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border" 
            style={{ 
              backgroundColor: `${accentColor}10`, 
              borderColor: `${accentColor}30` 
            }}
          >
            <i className={`ti ${iconClass} text-2xl`} aria-hidden="true" />
          </div>
          
          <h2 className="font-['Bebas_Neue',sans-serif] text-3xl tracking-[1.5px] text-[#E8E4DC] mb-2">
            {title}
          </h2>
          
          <p className="text-[#888888] text-[13px] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 px-6 pb-6 pt-2">
          <button
            type="button"
            className="flex-1 bg-transparent hover:bg-[#1A1A1A] border border-[#222] text-[#888] hover:text-[#E8E4DC] rounded-xl py-2.5 text-[13px] font-semibold cursor-pointer transition-all duration-200 focus:outline-none"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`flex-1 border-none rounded-xl py-2.5 text-[13px] font-bold cursor-pointer transition-all duration-200 focus:outline-none ${confirmBtnClass}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
