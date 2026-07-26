import { useCallback, useState } from 'react';

import { authClient, getApiError } from '../../../shared/api';
import { imageUriToDataUri } from '../../../shared/utils/imagePicker';
import { useAuthStore } from '../../../shared/store/authStore';
import { useClientProfileStore } from '../../../shared/store/clientProfileStore';

// Perfil del cliente: escribe en AuthService (PUT /users/profile) y en el
// documento Mongo (PUT /clients/:id) en el mismo submit para que nombre y
// teléfono queden sincronizados entre ambos backends.
export function useClientProfile() {
  const [saving, setSaving] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const points = useClientProfileStore((state) => state.points);
  const refreshPoints = useClientProfileStore((state) => state.refreshPoints);
  const updateClientProfile = useClientProfileStore((state) => state.updateClientProfile);

  const updateProfile = useCallback(
    async ({ name, phone, profilePicture }) => {
      setSaving(true);
      try {
        const profilePictureDataUri = profilePicture ? await imageUriToDataUri(profilePicture) : undefined;

        const [authRes, clientRes] = await Promise.all([
          authClient.put('/users/profile', {
            name,
            phone,
            ...(profilePictureDataUri ? { profilePicture: profilePictureDataUri } : {}),
          }),
          updateClientProfile({ name, phone, profilePicture }),
        ]);

        if (!clientRes.ok) {
          return { ok: false, error: clientRes.error };
        }

        const updatedAuthUser = authRes.data?.data;
        setUser({
          name: updatedAuthUser?.name ?? name,
          phone: updatedAuthUser?.phone ?? phone,
          profilePicture: updatedAuthUser?.profilePicture,
        });

        return { ok: true };
      } catch (error) {
        return { ok: false, error: getApiError(error, 'No se pudo actualizar tu perfil') };
      } finally {
        setSaving(false);
      }
    },
    [setUser, updateClientProfile]
  );

  // Igual UX que la web: "cambiar contraseña" solo reenvía el correo de
  // recuperación — no existe un endpoint de cambio de contraseña autenticado.
  const sendPasswordResetLink = useCallback(async () => {
    if (!user?.email) return { ok: false, error: 'No se encontró tu correo' };
    try {
      await authClient.post('/auth/forgot-password', { email: user.email });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiError(error, 'No se pudo enviar el enlace') };
    }
  }, [user]);

  return { user, points, saving, refreshPoints, updateProfile, sendPasswordResetLink };
}
