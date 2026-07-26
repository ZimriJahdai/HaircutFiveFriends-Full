import { useCallback, useEffect, useRef, useState } from 'react';

import { authClient, buildFormData, getApiError } from '../../../shared/api';
import { ROLES } from '../../../shared/constants';
import { useAuthStore } from '../../../shared/store/authStore';
import { useClientProfileStore } from '../../../shared/store/clientProfileStore';

// Toda la lógica de autenticación. Las screens solo hacen wiring.
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const loginToStore = useAuthStore((state) => state.login);
  const logoutFromStore = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const ensureClientId = useClientProfileStore((state) => state.ensureClientId);

  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);
  const stopLoading = () => {
    if (mountedRef.current) setLoading(false);
  };

  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      try {
        const { data } = await authClient.post('/auth/login', { email, password });
        const token = data?.token;
        const user = data?.userDetails || data?.user || null;
        if (!token || !user) {
          return { ok: false, error: 'Respuesta inválida del servidor' };
        }
        if (user.role !== ROLES.USER) {
          return {
            ok: false,
            error: 'Esta app es solo para clientes. Usa el panel web si eres administrador o empleado.',
          };
        }

        await loginToStore({ token, user });

        // Hidrata el perfil completo (email/phone/profilePicture) igual que la web.
        try {
          const profileRes = await authClient.get('/auth/profile');
          const fullProfile = profileRes.data?.data || profileRes.data;
          if (fullProfile) setUser(fullProfile);
        } catch {
          // No crítico: seguimos con los datos mínimos de userDetails.
        }

        const clientResult = await ensureClientId();
        if (!clientResult.ok) {
          await logoutFromStore();
          return { ok: false, error: clientResult.error };
        }

        return { ok: true };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo iniciar sesión') };
      } finally {
        stopLoading();
      }
    },
    [loginToStore, logoutFromStore, setUser, ensureClientId]
  );

  const register = useCallback(async (form) => {
    setLoading(true);
    try {
      const formData = await buildFormData(
        { name: form.name, email: form.email, password: form.password, phone: form.phone },
        form.profilePicture ? { uri: form.profilePicture, field: 'profilePicture' } : null
      );
      const { data } = await authClient.post('/auth/register', formData);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo crear la cuenta') };
    } finally {
      stopLoading();
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    try {
      const { data } = await authClient.post('/auth/verify-email', { token });
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo verificar el correo') };
    } finally {
      stopLoading();
    }
  }, []);

  const resendVerification = useCallback(async (email) => {
    setLoading(true);
    try {
      const { data } = await authClient.post('/auth/resend-verification', { email });
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo reenviar el correo') };
    } finally {
      stopLoading();
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    try {
      const { data } = await authClient.post('/auth/forgot-password', { email });
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo enviar el enlace') };
    } finally {
      stopLoading();
    }
  }, []);

  const resetPassword = useCallback(async ({ token, newPassword }) => {
    setLoading(true);
    try {
      const { data } = await authClient.post('/auth/reset-password', { token, newPassword });
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo restablecer la contraseña') };
    } finally {
      stopLoading();
    }
  }, []);

  return {
    loading,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  };
}
