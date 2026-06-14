import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../../shared/api/auth.js';

const inputCls =
  'w-full px-3.5 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors';

const labelCls = 'flex flex-col gap-1.5 text-[12px] font-medium text-[#5A5A5A]';

export const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async ({ email }) => {
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response?.message || 'Si el email existe, se ha enviado un enlace de recuperación');
    } catch (error) {
      toast.error(error.message || 'Error al solicitar recuperación');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC] m-0 leading-none">
        Recuperar contraseña
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className={labelCls}>
          Email
          <input
            type="email"
            className={inputCls}
            placeholder="correo@ejemplo.com"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
              },
            })}
          />
          {errors.email && (
            <span className="text-[#E88] text-[11px]">{errors.email.message}</span>
          )}
        </label>

        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none"
        >
          Enviar enlace
        </button>
      </form>
    </div>
  );
};
