import '../styles/auth.css';
import { useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
import { ResendVerificationForm } from '../components/ResendVerificationForm.jsx';

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-header">
          <h1>Haircut Five Friends</h1>
          <p>Inicia sesión, regístrate o recupera tu cuenta.</p>
        </div>

        <div className="auth-tabs">
          <button type="button" className={activeTab === 'login' ? 'active' : ''} onClick={() => setActiveTab('login')}>
            Login
          </button>
          <button type="button" className={activeTab === 'register' ? 'active' : ''} onClick={() => setActiveTab('register')}>
            Registro
          </button>
          <button type="button" className={activeTab === 'forgot' ? 'active' : ''} onClick={() => setActiveTab('forgot')}>
            Olvidé contraseña
          </button>
          <button type="button" className={activeTab === 'resend' ? 'active' : ''} onClick={() => setActiveTab('resend')}>
            Reenviar verificación
          </button>
        </div>

        <div className="auth-content">
          {activeTab === 'login' && <LoginForm />}
          {activeTab === 'register' && <RegisterForm onRegistered={() => setActiveTab('login')} />}
          {activeTab === 'forgot' && <ForgotPasswordForm />}
          {activeTab === 'resend' && <ResendVerificationForm />}
        </div>
      </div>
    </div>
  );
};
