import axios from 'axios';

const authBaseUrl = import.meta.env.VITE_AUTH_SERVICE_BASE_URL || '';

const authClient = axios.create({
  baseURL: authBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const parseError = (error) => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  if (error.response?.statusText) {
    return new Error(error.response.statusText);
  }
  return new Error(error.message || 'Error de red');
};

const requireAuthUrl = () => {
  if (!authBaseUrl) {
    throw new Error('VITE_AUTH_SERVICE_BASE_URL no está configurada');
  }
};

export const authService = {
  login: async (credentials) => {
    requireAuthUrl();
    try {
      const response = await authClient.post('/api/v1/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  register: async (formData) => {
    requireAuthUrl();
    try {
      const response = await authClient.post('/api/v1/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  verifyEmail: async (token) => {
    requireAuthUrl();
    try {
      const response = await authClient.post('/api/v1/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  resendVerification: async (email) => {
    requireAuthUrl();
    try {
      const response = await authClient.post('/api/v1/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  forgotPassword: async (email) => {
    requireAuthUrl();
    try {
      const response = await authClient.post('/api/v1/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  resetPassword: async (token, newPassword) => {
    requireAuthUrl();
    try {
      const response = await authClient.post('/api/v1/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  getProfile: async (token) => {
    requireAuthUrl();
    try {
      const response = await authClient.get('/api/v1/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },
};
