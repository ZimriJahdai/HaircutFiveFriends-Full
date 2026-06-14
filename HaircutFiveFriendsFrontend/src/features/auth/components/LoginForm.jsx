import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

const inputCls =
  'w-full px-3.5 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors';

const labelCls = 'flex flex-col gap-1.5 text-[12px] font-medium text-[#5A5A5A]';

export const LoginForm = ({ onChangeTab }) => {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    const result = await login(values);
    if (result.success) {
      toast.success('Inicio de sesión exitoso');
      const role = result.role || result.user?.role;
      if (role === 'USER_ROLE') {
        navigate('/client');
      } else if (role === 'ADMIN_ROLE') {
        navigate('/dashboard');
      } else if (role === 'ADMIN_RESTAURANTE' || role === 'ADMIN_RESTAURANT') {
        navigate('/admin-restaurante');
      } else {
        navigate('/auth');
      }
    } else {
      toast.error(result.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC] m-0 leading-none">
        Iniciar sesión
      </h2>

      {error && (
        <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
          <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
          {error}
        </div>
      )}

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

        <label className={labelCls}>
          Contraseña
          <input
            type="password"
            className={inputCls}
            placeholder="••••••••"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
          />
          {errors.password && (
            <span className="text-[#E88] text-[11px]">{errors.password.message}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Ingresando...
            </>
          ) : (
            'Ingresar'
          )}
        </button>
      </form>

      {typeof onChangeTab === 'function' && (
        <p className="text-center text-[12px] text-[#5A5A5A] mt-1">
          ¿Olvidaste tu contraseña?{' '}
          <button
            type="button"
            onClick={() => onChangeTab('forgot')}
            className="text-[#C9A84C] hover:underline cursor-pointer bg-transparent border-none p-0 text-[12px] font-medium focus:outline-none"
          >
            Recupérala aquí
          </button>
        </p>
      )}
    </div>
  );
};
