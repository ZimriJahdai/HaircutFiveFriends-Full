import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiClient, buildFormData, getApiError, getId, unwrap } from '../api';
import { useAuthStore } from './authStore';

const STORAGE_KEY = 'client-profile-storage';

const readPersisted = async () => {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);
    return { clientId: parsed?.state?.clientId ?? null, points: parsed?.state?.points ?? 0 };
  } catch {
    return null;
  }
};

const writePersisted = async ({ clientId, points }) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { clientId, points }, version: 0 }));
  } catch {
    // noop
  }
};

const clearPersisted = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
};

// Resuelve y cachea el `_id` de Mongo del Client asociado al usuario logueado.
// El backend no lo expone en ningún otro endpoint (ver GET /clients/me, agregado
// junto con este proyecto) — Productos/canje, Facturas y Perfil dependen de él.
export const useClientProfileStore = create((set, get) => ({
  clientId: null,
  points: 0,
  _resolved: false,

  ensureClientId: async () => {
    const { clientId } = get();
    if (clientId) return { ok: true, clientId };

    try {
      const res = await apiClient.get('/clients/me');
      const client = unwrap(res);
      const id = getId(client);
      if (!id) {
        return { ok: false, error: 'No pudimos preparar tu perfil de cliente. Contacta soporte.' };
      }
      const points = client?.points || 0;
      set({ clientId: id, points, _resolved: true });
      await writePersisted({ clientId: id, points });
      return { ok: true, clientId: id };
    } catch (error) {
      return {
        ok: false,
        error: getApiError(error, 'No pudimos preparar tu perfil de cliente. Contacta soporte.'),
      };
    }
  },

  refreshPoints: async () => {
    const { clientId } = get();
    if (!clientId) return;
    try {
      const res = await apiClient.get(`/clients/${clientId}/points`);
      const data = unwrap(res);
      const points = data?.points ?? 0;
      set({ points });
      await writePersisted({ clientId, points });
    } catch {
      // No crítico: la pantalla simplemente conserva el último valor conocido.
    }
  },

  updateClientProfile: async (payload) => {
    const { clientId } = get();
    if (!clientId) return { ok: false, error: 'Tu perfil de cliente aún no está listo' };
    try {
      const formData = await buildFormData(
        {
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          faceshape: payload.faceshape,
        },
        payload.profilePicture ? { uri: payload.profilePicture, field: 'profilePicture' } : null
      );
      const res = await apiClient.put(`/clients/${clientId}`, formData);
      return { ok: true, data: unwrap(res) };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo actualizar tu perfil') };
    }
  },

  reset: async () => {
    await clearPersisted();
    set({ clientId: null, points: 0, _resolved: false });
  },
}));

void (async () => {
  const persisted = await readPersisted();
  if (persisted?.clientId) {
    useClientProfileStore.setState({ ...persisted, _resolved: true });
  }
})();

// Limpia el clientId cacheado cuando la sesión termina (logout manual o 401),
// para que una cuenta distinta no herede el clientId de la anterior.
useAuthStore.subscribe((state, prevState) => {
  if (prevState.isAuthenticated && !state.isAuthenticated) {
    useClientProfileStore.getState().reset();
  }
});
