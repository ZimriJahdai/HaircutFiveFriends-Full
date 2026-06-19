import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../../../shared/api/auth.js';

const ALLOWED_ROLES = [
  'ADMIN_ROLE',
  'USER_ROLE',
  'EMPLOYEE_ROLE',
];

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isLoadingAuth: true,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      initializeAuth: async () => {
        set({ isLoadingAuth: true, error: null });
        const token = get().token;

        if (token) {
          try {
            const response = await authService.getProfile(token);
            if (response?.success && response.data) {
              set({
                user: response.data,
                isAuthenticated: true,
                error: null,
              });
            } else {
              set({ user: null, token: null, isAuthenticated: false });
            }
          } catch (error) {
            set({ user: null, token: null, isAuthenticated: false });
          }
        }

        set({ isLoadingAuth: false });
      },

      login: async ({ email, password }) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.login({ email, password });
          if (!response?.success) {
            throw new Error(response?.message || 'Error al iniciar sesión');
          }

          const token = response.token;
          const role = (response.userDetails || response.user)?.role;

          if (!ALLOWED_ROLES.includes(role)) {
            throw new Error(`Rol no autorizado: ${role}`);
          }
          set({ token });
          const profileResponse = await authService.getProfile(token);
          const user = profileResponse?.data || response.userDetails || response.user;

          set({
            user,
            token,
            expiresAt: response.expiresAt ? new Date(response.expiresAt).toISOString() : null,
            refreshToken: response.refreshToken || null,
            isAuthenticated: true,
            isLoadingAuth: false,
            loading: false,
            error: null,
          });

          return { success: true, user, role };
        } catch (error) {
          const message = error?.message || 'Error en login';
          set({ loading: false, error: message });
          return { success: false, message };
        }
      },

      register: async (formData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(formData);
          set({ loading: false });
          return response;
        } catch (error) {
          const message = error?.message || 'Error en registro';
          set({ loading: false, error: message });
          return { success: false, message };
        }
      },

      logout: () => {
        set({ ...initialState, isLoadingAuth: false });
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: {
            ...state.user,
            ...updatedUser,
          },
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
