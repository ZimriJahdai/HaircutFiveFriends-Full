import '../styles/auth.css';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-card">
          <h1>Acceso denegado</h1>
          <p>No tienes permiso para ingresar a esta sección.</p>
          <button type="button" className="auth-button" onClick={() => navigate('/auth')}>
            Volver al login
          </button>
        </div>
      </div>
    </div>
  );
};
