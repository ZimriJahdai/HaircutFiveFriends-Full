import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

const inputCls =
  'w-full px-3.5 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors';

export const UserProfile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = useState(user?.name || '');

  const onSave = () => {
    updateUser({ name });
    toast.success('Perfil actualizado en sesión');
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC] m-0 leading-none">
        Perfil
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-[#5A5A5A]">Nombre</span>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-[#5A5A5A]">Email</span>
          <span className="text-[13px] text-[#E8E4DC]">{user?.email || 'Sin email'}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-[#5A5A5A]">Rol</span>
          <span className="text-[13px] text-[#E8E4DC]">{user?.role || 'No disponible'}</span>
        </div>
      </div>

      <div className="h-[1px] bg-[#C9A84C]/10" />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 bg-transparent hover:bg-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
