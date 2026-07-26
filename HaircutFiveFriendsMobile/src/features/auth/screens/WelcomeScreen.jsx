import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient, Button } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';

export function WelcomeScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <BrandGradient style={[styles.hero, { paddingTop: insets.top + SPACING.xxxl, paddingBottom: insets.bottom + SPACING.xl }]}>
      <View style={styles.content}>
        <View style={styles.brandBadge}>
          <MaterialIcons name="content-cut" size={40} color={colors.primary} />
        </View>
        <Text style={styles.brand}>HAIRCUT FIVE FRIENDS</Text>
        <Text style={styles.tagline}>Reserva tu cita, explora servicios y gana puntos, todo desde tu teléfono.</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Iniciar sesión" gradient onPress={() => navigation.navigate('Login')} />
        <Button title="Crear cuenta" variant="secondary" onPress={() => navigation.navigate('Register')} />
      </View>
    </BrandGradient>
  );
}

const createStyles = (colors) => StyleSheet.create({
  hero: { flex: 1, justifyContent: 'space-between', paddingHorizontal: SPACING.xl },
  content: { alignItems: 'center', marginTop: SPACING.xxxl },
  brandBadge: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  brand: {
    fontSize: FONT_SIZE.xxl,
    fontFamily: FONTS.displayBold,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  actions: { gap: SPACING.md },
});
