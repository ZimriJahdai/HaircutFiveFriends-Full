import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../../shared/api/auth.js';

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
    <div className="auth-card">
      <h2>Recuperar contraseña</h2>
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

        <button type="submit" className="auth-button">
          Enviar enlace
        </button>
      </form>
    </div>
  );
};
