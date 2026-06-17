export const ProfileQuickActions = ({ onOpenPasswordModal, onLogout }) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#00D2C4]/10 flex items-center justify-center">
          <i className="ti ti-bolt text-[#00D2C4] text-base" />
        </div>
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">
          Acciones Rápidas
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenPasswordModal}
          className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00D2C4]/30 hover:bg-[#00D2C4]/[0.04] transition-all duration-300 cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <i className="ti ti-key text-amber-400 text-lg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Cambiar contraseña</p>
            <p className="text-[11px] text-zinc-500">Actualiza tu clave de acceso</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.04] transition-all duration-300 cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
            <i className="ti ti-logout text-red-400 text-lg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Cerrar sesión</p>
            <p className="text-[11px] text-zinc-500">Salir de tu cuenta</p>
          </div>
        </button>
      </div>
    </>
  );
};
