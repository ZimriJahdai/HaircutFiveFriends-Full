import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../../shared/api/auth.js';

/* ─── shared Tailwind helpers ─────────────────────────────────────────────── */
const inputCls =
  'w-full px-3.5 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors';

const labelCls = 'flex flex-col gap-1.5 text-[12px] font-medium text-[#5A5A5A]';

const btnPrimary =
  'w-full flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none';

const btnSecondary =
  'w-full flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async ({ newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response?.success) {
        toast.success(response.message || 'Contraseña actualizada');
        navigate('/auth');
      } else {
        toast.error(response?.message || 'Error al resetear contraseña');
      }
    } catch (error) {
      toast.error(error.message || 'Error al resetear contraseña');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#0A0A0A] font-sans">
      <div className="w-full max-w-[480px] bg-[#111111] border border-[#C9A84C]/20 rounded-2xl overflow-hidden shadow-[0_14px_60px_rgba(0,0,0,0.6)]">

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#C9A84C]/20 text-center">
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#C9A84C] mb-1 leading-none">
            Resetear contraseña
          </h1>
          <p className="text-[13px] text-[#5A5A5A] m-0">
            Ingresa tu nueva contraseña para completar la recuperación.
          </p>
        </div>

        {/* Card */}
        <div className="px-8 py-6 flex flex-col gap-4">
          {!token ? (
            <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
              <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
              Falta el token de recuperación. Usa el enlace enviado por email.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <label className={labelCls}>
                Nueva contraseña
                <input
                  type="password"
                  className={inputCls}
                  {...register('newPassword', {
                    required: 'La nueva contraseña es obligatoria',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                />
                {errors.newPassword && (
                  <span className="text-[#E88] text-[11px]">{errors.newPassword.message}</span>
                )}
              </label>

              <label className={labelCls}>
                Repetir contraseña
                <input
                  type="password"
                  className={inputCls}
                  {...register('confirmPassword', {
                    required: 'Debes confirmar la contraseña',
                  })}
                />
                {errors.confirmPassword && (
                  <span className="text-[#E88] text-[11px]">{errors.confirmPassword.message}</span>
                )}
              </label>

              <button type="submit" className={btnPrimary}>
                Actualizar contraseña
              </button>
            </form>
          )}

          <div className="h-[1px] bg-[#C9A84C]/10" />

          <button type="button" className={btnSecondary} onClick={() => navigate('/auth')}>
            Volver al login
          </button>
        </div>
      </div>
    </div>
  );
};
