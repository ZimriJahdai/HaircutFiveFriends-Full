import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input } from '../../../shared/components';
import { notify } from '../../../shared/utils/confirm';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useAuth } from '../hooks/useAuth';

export function ForgotPasswordScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState('');

  // El backend siempre responde éxito (anti-enumeración de correos).
  const onSubmit = async () => {
    await forgotPassword(email.trim());
    notify('Enlace enviado', 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.', () =>
      navigation.navigate('Login')
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Te enviaremos un enlace para restablecerla.</Text>

        <Input
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="mail-outline"
        />

        <Button title="Enviar enlace" gradient onPress={onSubmit} loading={loading} disabled={!email.trim()} />
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
