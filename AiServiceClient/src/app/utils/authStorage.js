const AUTH_KEY = 'todogemini_auth';

export const getAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

export const setAuth = (payload) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
};
