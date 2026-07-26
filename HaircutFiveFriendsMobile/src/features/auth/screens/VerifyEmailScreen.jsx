import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, LoadingSpinner } from '../../../shared/components';
import { notify } from '../../../shared/utils/confirm';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useAuth } from '../hooks/useAuth';

// Destino de deep link (haircutfivefriends://verify-email?token=...). Si llega
// un token por params se auto-envía; si no, se permite pegarlo a mano (el
// enlace del correo puede abrirse en otro dispositivo).
export function VerifyEmailScreen({ route, navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { verifyEmail, resendVerification, loading } = useAuth();
  const [manualToken, setManualToken] = useState('');
  const [verified, setVerified] = useState(false);
  const autoSubmitted = useRef(false);
  const email = route.params?.email;
  const paramToken = route.params?.token;

  const submitToken = async (token) => {
    const result = await verifyEmail(token);
    if (!result.ok) {
      notify('Error', result.error);
      return;
    }
    setVerified(true);
  };

  useEffect(() => {
    if (paramToken && !autoSubmitted.current) {
      autoSubmitted.current = true;
      submitToken(paramToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramToken]);

  const onResend = async () => {
    if (!email) {
      notify('Falta el correo', 'Vuelve a la pantalla de inicio de sesión e ingresa tu correo.');
      return;
    }
    const result = await resendVerification(email);
    notify(result.ok ? 'Enviado' : 'Error', result.ok ? 'Revisa tu correo nuevamente.' : result.error);
  };

  if (paramToken && loading) return <LoadingSpinner message="Verificando tu correo..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Verifica tu correo</Text>

        {verified ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>¡Tu correo quedó verificado! Ya puedes iniciar sesión.</Text>
            <Button title="Ir a iniciar sesión" gradient onPress={() => navigation.navigate('Login')} />
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Te enviamos un enlace de verificación{email ? ` a ${email}` : ''}. Si lo abriste en otro
              dispositivo, pega aquí el código del enlace.
            </Text>

            <Input
              label="Código de verificación"
              value={manualToken}
              onChangeText={setManualToken}
              autoCapitalize="none"
              placeholder="Pega el código aquí"
            />

            <Button
              title="Verificar"
              gradient
              onPress={() => submitToken(manualToken.trim())}
              loading={loading}
              disabled={!manualToken.trim()}
            />

            <TouchableOpacity onPress={onResend} style={styles.linkRow}>
              <Text style={styles.link}>Reenviar correo de verificación</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: SPACING.xl },
  title: { fontSize: FONT_SIZE.xxl, fontFamily: FONTS.displayBold, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.xl },
  link: { color: colors.primary, fontFamily: FONTS.bold, fontWeight: '700', fontSize: FONT_SIZE.sm },
  linkRow: { alignItems: 'center', marginTop: SPACING.lg },
  successBox: { gap: SPACING.lg, marginTop: SPACING.lg },
  successText: { fontSize: FONT_SIZE.md, fontFamily: FONTS.body, color: colors.success },
});
