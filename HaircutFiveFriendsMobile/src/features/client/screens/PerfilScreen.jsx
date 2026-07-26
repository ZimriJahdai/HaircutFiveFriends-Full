import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { LoadingSpinner } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { confirmAction, notify } from '../../../shared/utils/confirm';
import { pickProfileImage } from '../../../shared/utils/imagePicker';
import { useClientProfile } from '../hooks/useClientProfile';
import { ProfileAvatar, ProfileInfoForm, ProfileMenu, ProfileQuickActions } from '../components';

export function PerfilScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const logout = useAuthStore((state) => state.logout);
  const { user, saving, updateProfile, sendPasswordResetLink } = useClientProfile();
  const [imageUri, setImageUri] = useState(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!user) return <LoadingSpinner message="Cargando tu perfil..." />;

  const handlePickAvatar = async () => {
    const result = await pickProfileImage();
    if (result.error) return notify('Permiso requerido', result.error);
    if (!result.canceled) setImageUri(result.uri);
  };

  const onSubmit = async (values) => {
    const result = await updateProfile({ name: values.name, phone: values.phone, profilePicture: imageUri });
    if (!result.ok) {
      notify('Error', result.error);
      return;
    }
    setImageUri(null);
    notify('Perfil actualizado', 'Tus datos se guardaron correctamente.');
  };

  const onSendPasswordReset = async () => {
    setSendingReset(true);
    const result = await sendPasswordResetLink();
    setSendingReset(false);
    notify(
      result.ok ? 'Enlace enviado' : 'Error',
      result.ok ? `Revisa tu correo ${user.email} para continuar.` : result.error
    );
  };

  const onLogout = () =>
    confirmAction({
      title: 'Cerrar sesión',
      message: '¿Seguro que deseas salir?',
      confirmText: 'Salir',
      destructive: true,
      onConfirm: logout,
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={colors.primary} />}
    >
      <ProfileAvatar avatar={imageUri || user.profilePicture} name={user.name} email={user.email} onPress={handlePickAvatar} editable />

      <ProfileInfoForm
        defaultValues={{ name: user.name || '', phone: user.phone || '' }}
        onSubmit={onSubmit}
        saving={saving}
      />

      <ProfileMenu navigation={navigation} />

      <ProfileQuickActions onSendPasswordReset={onSendPasswordReset} sendingReset={sendingReset} onLogout={onLogout} />
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: SPACING.lg, gap: SPACING.md },
});
