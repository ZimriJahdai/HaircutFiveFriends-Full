import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';
const STORAGE_KEY = 'auth-storage';

const readPersistedAuthState = async () => {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    return {
      token: parsed?.state?.token ?? null,
      user: parsed?.state?.user ?? null,
      isAuthenticated: Boolean(parsed?.state?.isAuthenticated),
    };
  } catch {
    return null;
  }
};

const writePersistedAuthState = async ({ token, user, isAuthenticated }) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { token, user, isAuthenticated }, version: 0 })
    );
  } catch {
    // noop
  }
};

const clearPersistedAuthState = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
};

// Guarda el token en SecureStore (dato sensible). No bloquea el flujo si falla.
const persistTokenSecurely = async (token) => {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // SecureStore puede no estar disponible (web); el token igual queda en memoria/AsyncStorage.
  }
};

const clearTokenSecurely = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // noop
  }
};

export const useAuthStore = create((set) => ({
  token: null,
  user: null, // { id, name, email, phone, profilePicture, role }
  isAuthenticated: false,
  _hasHydrated: false,
  // Motivo de un logout forzado (ej. token expirado), leído una vez por AuthStack
  // para mostrar un aviso y luego limpiado. No existe refresh-token en el backend.
  lastLogoutReason: null,

  // Llamado tras un login exitoso: { token, user }.
  login: async ({ token, user }) => {
    await Promise.all([
      persistTokenSecurely(token),
      writePersistedAuthState({ token, user, isAuthenticated: true }),
    ]);
    set({ token, user, isAuthenticated: true, lastLogoutReason: null });
  },

  logout: async (reason = null) => {
    await Promise.all([clearTokenSecurely(), clearPersistedAuthState()]);
    set({ token: null, user: null, isAuthenticated: false, lastLogoutReason: reason });
  },

  clearLogoutReason: () => set({ lastLogoutReason: null }),

  // Merge parcial del perfil (tras GET /auth/profile o una edición).
  setUser: (patch) => set((state) => ({ user: { ...(state.user || {}), ...patch } })),

  setHasHydrated: (value) => set({ _hasHydrated: value }),
}));

void (async () => {
  const persisted = await readPersistedAuthState();
  if (persisted) {
    useAuthStore.setState(persisted);
  }
  useAuthStore.getState().setHasHydrated(true);
})();
