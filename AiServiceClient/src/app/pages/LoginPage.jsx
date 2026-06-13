import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authApi.js';
import { setAuth } from '../utils/authStorage.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const loading = status === 'loading';

  // Aborta el login en vuelo al desmontar.
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await login({ email, password, signal: controller.signal });
      setAuth(result);
      setStatus('success');
      navigate('/chat');
    } catch (err) {
      if (err?.name === 'AbortError') return; // componente desmontado
      setStatus('error');
      setError(err.message || 'Error al iniciar sesion.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
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
            autoComplete="email"
            disabled={loading}
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
            autoComplete="current-password"
            disabled={loading}
            className="login-input"
          />

          {error && <div className="login-error" role="alert">{error}</div>}

          <button className="ghost-button" type="submit" disabled={loading} aria-busy={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </section>
  );
}
