import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../../../shared/components';
import { notify } from '../../../shared/utils/confirm';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useAuth } from '../hooks/useAuth';
import { AuthHero, FormField } from '../components';

export function LoginScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { login, loading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    const result = await login({ email: values.email.trim(), password: values.password });
    if (!result.ok) notify('Error', result.error);
    // En éxito, authStore cambia isAuthenticated y AppNavigator monta MainTabs.
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <AuthHero />

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Bienvenido de nuevo</Text>
            <Text style={styles.formSubtitle}>Inicia sesión para continuar</Text>

            <FormField
              control={control}
              name="email"
              rules={{
                required: 'El correo es requerido',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
              }}
              label="Correo electrónico"
              leftIcon="mail-outline"
              placeholder="tucorreo@ejemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email?.message}
            />

            <FormField
              control={control}
              name="password"
              rules={{ required: 'La contraseña es requerida' }}
              label="Contraseña"
              leftIcon="lock-outline"
              placeholder="••••••••"
              secureTextEntry
              error={errors.password?.message}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkRight}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Button title="Iniciar sesión" gradient onPress={handleSubmit(onSubmit)} loading={loading} />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.signupRow}>
              <Text style={styles.muted}>¿No tienes cuenta? </Text>
              <Text style={styles.link}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  formCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  formTitle: { fontSize: FONT_SIZE.xl, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text },
  formSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  linkRight: { alignSelf: 'flex-end', marginBottom: SPACING.lg },
  link: { color: colors.primary, fontFamily: FONTS.bold, fontWeight: '700', fontSize: FONT_SIZE.sm },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.lg },
  muted: { color: colors.textSecondary, fontFamily: FONTS.body, fontSize: FONT_SIZE.sm },
});
