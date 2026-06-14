import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

const inputCls =
  'w-full px-3.5 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors';

const labelCls = 'flex flex-col gap-1.5 text-[12px] font-medium text-[#5A5A5A]';

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export const RegisterForm = ({ onRegistered, onChangeTab }) => {
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      profilePicture: null,
    },
  });

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('phone', values.phone.replace(/\D/g, ''));
    formData.append('password', values.password);
    if (values.profilePicture?.[0]) {
      formData.append('profilePicture', values.profilePicture[0]);
    }

    const result = await registerUser(formData);
    if (result?.success) {
      toast.success(result.message || 'Registro exitoso. Verifica tu email.');
      if (typeof onRegistered === 'function') {
        onRegistered();
      }
    } else {
      toast.error(result?.message || 'Error en el registro');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[2px] text-[#E8E4DC] m-0 leading-none">
        Registro
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className={labelCls}>
          Nombre
          <input
            type="text"
            className={inputCls}
            placeholder="Tu nombre completo"
            {...register('name', { required: 'El nombre es obligatorio' })}
          />
          {errors.name && (
            <span className="text-[#E88] text-[11px]">{errors.name.message}</span>
          )}
        </label>

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
          Teléfono
          <input
            type="tel"
            maxLength={9}
            className={inputCls}
            placeholder="1234-5678"
            value={watch('phone') || ''}
            {...register('phone', {
              required: 'El teléfono es obligatorio',
              pattern: {
                value: /^\d{4}-\d{4}$/,
                message: 'Formato obligatorio: 1234-5678',
              },
            })}
            onChange={(event) => {
              const onlyDigits = event.target.value.replace(/\D/g, '');
              const formatted = formatPhone(onlyDigits);
              setValue('phone', formatted, { shouldValidate: true });
            }}
          />
          {errors.phone && (
            <span className="text-[#E88] text-[11px]">{errors.phone.message}</span>
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

        <label className={labelCls}>
          Foto de perfil
          <input
            type="file"
            accept="image/*"
            className="text-[12px] text-[#5A5A5A] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-[#C9A84C]/40 file:text-[11px] file:text-[#C9A84C] file:bg-transparent file:cursor-pointer file:transition-colors hover:file:bg-[#C9A84C]/10"
            {...register('profilePicture')}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Registrando...
            </>
          ) : (
            'Registrarse'
          )}
        </button>
      </form>

      {typeof onChangeTab === 'function' && (
        <p className="text-center text-[12px] text-[#5A5A5A] mt-1">
          ¿No recibiste el email de verificación?{' '}
          <button
            type="button"
            onClick={() => onChangeTab('resend')}
            className="text-[#C9A84C] hover:underline cursor-pointer bg-transparent border-none p-0 text-[12px] font-medium focus:outline-none"
          >
            Reenviarlo aquí
          </button>
        </p>
      )}
    </div>
  );
};
