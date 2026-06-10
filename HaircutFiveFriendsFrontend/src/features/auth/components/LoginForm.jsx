import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

export const LoginForm = () => {
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
    <div className="auth-card">
      <h2>Iniciar sesión</h2>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};
