import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../../shared/api/auth.js';
import '../styles/auth.css';

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
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-header">
          <h1>Resetear contraseña</h1>
          <p>Ingresa tu nueva contraseña para completar la recuperación.</p>
        </div>

        <div className="auth-card">
          {!token ? (
            <p className="auth-error">Falta el token de recuperación. Usa el enlace enviado por email.</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <label>
                Nueva contraseña
                <input
                  type="password"
                  {...register('newPassword', {
                    required: 'La nueva contraseña es obligatoria',
                    minLength: {
                      value: 8,
                      message: 'Mínimo 8 caracteres',
                    },
                  })}
                />
                {errors.newPassword && <span className="auth-help">{errors.newPassword.message}</span>}
              </label>

              <label>
                Repetir contraseña
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Debes confirmar la contraseña',
                  })}
                />
                {errors.confirmPassword && <span className="auth-help">{errors.confirmPassword.message}</span>}
              </label>

              <button type="submit" className="auth-button">
                Actualizar contraseña
              </button>
            </form>
          )}
          <button type="button" className="auth-button auth-button-secondary" onClick={() => navigate('/auth')}>
            Volver al login
          </button>
        </div>
      </div>
    </div>
  );
};
