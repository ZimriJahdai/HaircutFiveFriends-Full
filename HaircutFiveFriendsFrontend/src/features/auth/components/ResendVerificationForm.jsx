import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../../shared/api/auth.js';

export const ResendVerificationForm = () => {
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
      const response = await authService.resendVerification(email);
      toast.success(response?.message || 'Email de verificación reenviado');
    } catch (error) {
      toast.error(error.message || 'Error al reenviar verificación');
    }
  };

  return (
    <div className="auth-card">
      <h2>Reenviar verificación</h2>
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
          Reenviar email
        </button>
      </form>
    </div>
  );
};
