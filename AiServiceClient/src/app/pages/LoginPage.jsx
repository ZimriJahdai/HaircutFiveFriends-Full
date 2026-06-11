import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authApi.js';
import { setAuth } from '../utils/authStorage.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const result = await login({ email, password });
      setAuth(result);
      setStatus('success');
      navigate('/chat');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Error al iniciar sesion.');
    }
  };

  return (
    <section className="page">
      <div className="page-head">
        <h1>Iniciar sesion</h1>
        <p>Usa tus credenciales del AuthService para activar el chat y las herramientas.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@dominio.com"
            required
            className="login-input"
          />

          <label className="login-label" htmlFor="password">Contrasena</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            required
            className="login-input"
          />

          {error && <div className="login-error">{error}</div>}

          <button className="ghost-button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </section>
  );
}
