import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export const RegisterForm = ({ onRegistered }) => {
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
    formData.append('phone', values.phone);
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
    <div className="auth-card">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <label>
          Nombre
          <input
            type="text"
            {...register('name', { required: 'El nombre es obligatorio' })}
          />
          {errors.name && <span className="auth-help">{errors.name.message}</span>}
        </label>

        <label>
          Email
          <input
            type="email"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
              },
            })}
          />
          {errors.email && <span className="auth-help">{errors.email.message}</span>}
        </label>

        <label>
          Teléfono
          <input
            type="tel"
            maxLength={9}
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
          {errors.phone && <span className="auth-help">{errors.phone.message}</span>}
        </label>

        <label>
          Contraseña
          <input
            type="password"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 8,
                message: 'Mínimo 8 caracteres',
              },
            })}
          />
          {errors.password && <span className="auth-help">{errors.password.message}</span>}
        </label>

        <label>
          Foto de perfil
          <input type="file" {...register('profilePicture')} accept="image/*" />
        </label>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};
