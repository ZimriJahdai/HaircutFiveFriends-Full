import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input } from '../../../shared/components';
import { notify } from '../../../shared/utils/confirm';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useAuth } from '../hooks/useAuth';

// Destino de deep link (haircutfivefriends://reset-password?token=...). El
// token también puede pegarse a mano si el enlace se abrió en otro dispositivo.
export function ResetPasswordScreen({ route, navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { resetPassword, loading } = useAuth();
  const [token, setToken] = useState(route.params?.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSubmit = async () => {
    if (newPassword.length < 8) {
      notify('Contraseña muy corta', 'Debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('Las contraseñas no coinciden', 'Verifica ambos campos.');
      return;
    }
    const result = await resetPassword({ token: token.trim(), newPassword });
    if (!result.ok) {
      notify('Error', result.error);
      return;
    }
    notify('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.', () =>
      navigation.navigate('Login')
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Restablecer contraseña</Text>
        <Text style={styles.subtitle}>Pega el código del enlace que recibiste por correo.</Text>

        <Input label="Código" value={token} onChangeText={setToken} autoCapitalize="none" placeholder="Pega el código aquí" />
        <Input label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Input label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <Button
          title="Restablecer contraseña"
          gradient
          onPress={onSubmit}
          loading={loading}
          disabled={!token.trim() || !newPassword || !confirmPassword}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: SPACING.xl },
  title: { fontSize: FONT_SIZE.xxl, fontFamily: FONTS.displayBold, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.xl },
});
