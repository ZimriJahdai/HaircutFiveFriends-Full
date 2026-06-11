import { clearAuth } from './authStorage.js';

export const handleUnauthorized = (response) => {
  if (!response || response.status !== 401) return false;

  clearAuth();

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }

  return true;
};
