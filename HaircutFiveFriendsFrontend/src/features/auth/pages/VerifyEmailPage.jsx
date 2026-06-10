import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail.js';
import '../styles/auth.css';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromQuery = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [manualToken, setManualToken] = useState('');
  const { isLoading, success, message, error, verify } = useVerifyEmail(tokenFromQuery);

  const onSubmit = async (event) => {
    event.preventDefault();
    await verify(manualToken);
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-header">
          <h1>Verificar email</h1>
          <p>Usa el token enviado por email o pega el enlace de verificación.</p>
        </div>

        <div className="auth-card">
          {tokenFromQuery ? (
            <>
              <p>{isLoading ? 'Validando token...' : success ? 'Verificación completada' : 'Verificación pendiente'}</p>
              {message && <p>{message}</p>}
              {error && <p className="auth-error">{error}</p>}
            </>
          ) : (
            <form onSubmit={onSubmit} className="auth-form">
              <label>
                Token de verificación
                <input value={manualToken} onChange={(e) => setManualToken(e.target.value)} placeholder="Token de email" />
              </label>
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Verificar email'}
              </button>
              {message && <p>{message}</p>}
              {error && <p className="auth-error">{error}</p>}
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
