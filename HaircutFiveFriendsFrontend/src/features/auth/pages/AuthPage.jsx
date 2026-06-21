import { useState } from 'react';
import FondoImage from '../../../assets/img/Fondo.png';
import { LoginForm } from '../components/LoginForm.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
import { ResendVerificationForm } from '../components/ResendVerificationForm.jsx';

const MAIN_TABS = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Registro' },
];

const SECONDARY_LABELS = {
  forgot: 'Recuperar contraseña',
  resend: 'Reenviar verificación',
};

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [prevTab, setPrevTab] = useState('login');

  const goTo = (tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const goBack = () => setActiveTab(prevTab);

  const isSecondary = activeTab === 'forgot' || activeTab === 'resend';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 font-sans"
      style={{
        backgroundImage: `url(${FondoImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-[560px] bg-[#111111]/95 border border-[#C9A84C]/20 rounded-2xl overflow-hidden shadow-[0_14px_60px_rgba(0,0,0,0.6)] backdrop-blur-sm">

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#C9A84C]/20 text-center">
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#C9A84C] mb-1 leading-none">
            Haircut Five Friends
          </h1>
          <p className="text-[13px] text-[#5A5A5A] m-0">
            Inicia sesión o crea tu cuenta.
          </p>
        </div>

        {/* Tabs or back link */}
        {isSecondary ? (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-[#C9A84C]/20 bg-[#C9A84C]/5">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-[#C9A84C] hover:text-[#E8E4DC] bg-transparent border-none p-0 text-[12px] font-medium cursor-pointer transition-colors focus:outline-none"
            >
              <i className="ti ti-arrow-left text-[14px]" aria-hidden="true" />
              Volver
            </button>
            <span className="text-[#2A2A2A]">|</span>
            <span className="text-[12px] text-[#5A5A5A] font-medium">
              {SECONDARY_LABELS[activeTab]}
            </span>
          </div>
        ) : (
          <div className="flex border-b border-[#C9A84C]/20">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => goTo(tab.key)}
                className={[
                  'flex-1 py-3 px-2 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none border-b-2',
                  activeTab === tab.key
                    ? 'text-[#C9A84C] border-[#C9A84C] bg-[#C9A84C]/5'
                    : 'text-[#5A5A5A] border-transparent hover:text-[#E8E4DC] bg-transparent',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="px-8 py-6">
          {activeTab === 'login' && <LoginForm onChangeTab={goTo} />}
          {activeTab === 'register' && <RegisterForm onRegistered={() => goTo('login')} onChangeTab={goTo} />}
          {activeTab === 'forgot' && <ForgotPasswordForm />}
          {activeTab === 'resend' && <ResendVerificationForm />}
        </div>
      </div>
    </div>
  );
};
