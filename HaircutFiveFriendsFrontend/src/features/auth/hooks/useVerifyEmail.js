import { useCallback, useEffect, useState } from 'react';
import { authService } from '../../../shared/api/auth.js';

export const useVerifyEmail = (token) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(undefined);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const verify = useCallback(
    async (verifyToken) => {
      const tokenToUse = verifyToken || token;
      if (!tokenToUse) {
        setSuccess(false);
        setMessage('Token requerido');
        return;
      }

      setIsLoading(true);
      setError(null);
      setMessage('');

      try {
        const response = await authService.verifyEmail(tokenToUse);
        setSuccess(response?.success ?? true);
        setMessage(response?.message || 'Email verificado correctamente');
      } catch (err) {
        setSuccess(false);
        setError(err.message || 'No se pudo verificar el email');
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      verify(token);
    }
  }, [token, verify]);

  return {
    isLoading,
    success,
    message,
    error,
    verify,
  };
};
