import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail.js';

const inputCls =
  'w-full px-3.5 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[13px] text-[#E8E4DC] placeholder-[#5A5A5A] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors';

const labelCls = 'flex flex-col gap-1.5 text-[12px] font-medium text-[#5A5A5A]';

const btnPrimary =
  'w-full flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#0A0A0A] border border-[#C9A84C] rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

const btnSecondary =
  'w-full flex items-center justify-center gap-1.5 bg-transparent hover:bg-[#2A2A2A] text-[#5A5A5A] hover:text-[#E8E4DC] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors focus:outline-none';

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
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#0A0A0A] font-sans">
      <div className="w-full max-w-[480px] bg-[#111111] border border-[#C9A84C]/20 rounded-2xl overflow-hidden shadow-[0_14px_60px_rgba(0,0,0,0.6)]">

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#C9A84C]/20 text-center">
          <h1 className="font-['Bebas_Neue',sans-serif] text-4xl tracking-[3px] text-[#C9A84C] mb-1 leading-none">
            Verificar email
          </h1>
          <p className="text-[13px] text-[#5A5A5A] m-0">
            Usa el token enviado por email o pega el enlace de verificación.
          </p>
        </div>

        {/* Card */}
        <div className="px-8 py-6 flex flex-col gap-4">
          {tokenFromQuery ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-[#2A2A2A] border-t-[#C9A84C] rounded-full animate-spin" />
                  <p className="text-[13px] text-[#5A5A5A]">Validando token...</p>
                </>
              ) : success ? (
                <>
                  <i className="ti ti-circle-check text-5xl text-[#8E8]" aria-hidden="true" />
                  <p className="text-[13px] text-[#8E8]">Verificación completada</p>
                </>
              ) : (
                <>
                  <i className="ti ti-alert-circle text-5xl text-[#E88]" aria-hidden="true" />
                  <p className="text-[13px] text-[#E88]">Verificación pendiente</p>
                </>
              )}
              {message && <p className="text-[12px] text-[#5A5A5A]">{message}</p>}
              {error && (
                <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] w-full flex items-center gap-2">
                  <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className={labelCls}>
                Token de verificación
                <input
                  className={inputCls}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Token de email"
                />
              </label>

              <button type="submit" className={btnPrimary} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar email'
                )}
              </button>

              {message && <p className="text-[12px] text-[#5A5A5A] text-center">{message}</p>}
              {error && (
                <div className="bg-[#2A1515] border border-[#5A2020] rounded-lg px-3.5 py-2.5 text-[12px] text-[#E88] flex items-center gap-2">
                  <i className="ti ti-alert-circle text-lg" aria-hidden="true" />
                  {error}
                </div>
              )}
            </form>
          )}

          <div className="h-[1px] bg-[#C9A84C]/10" />

          <button type="button" className={btnSecondary} onClick={() => navigate('/auth')}>
            Volver al login
          </button>
        </div>
      </div>
    </div>
  );
};
