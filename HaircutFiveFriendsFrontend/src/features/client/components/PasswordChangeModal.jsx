import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { authService } from '../../../shared/api/auth.js';

export const PasswordChangeModal = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [isSaving, setIsSaving] = useState(false);
  const user = useAuthStore((s) => s.user);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await authService.forgotPassword(user?.email);
      toast.success('Se ha enviado un enlace de restablecimiento a tu correo');
      onClose();
    } catch {
      toast.error('Error al enviar el enlace de restablecimiento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-[#111111] border border-white/[0.08] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <i className="ti ti-key text-amber-400 text-lg" />
            </div>
            <h3 className="text-base font-bold text-white">Cambiar Contraseña</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-zinc-400 mb-5">
            Se enviará un enlace de restablecimiento de contraseña a tu correo electrónico{' '}
            <span className="text-[#00D2C4] font-medium">{user?.email}</span>.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00D2C4] hover:bg-[#00B4A8] disabled:opacity-40 text-[#0A0A0A] font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer"
            >
              {isSaving ? (
                <i className="ti ti-loader-2 animate-spin text-base" />
              ) : (
                <i className="ti ti-mail text-base" />
              )}
              {isSaving ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10 font-medium text-sm px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
