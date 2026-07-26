import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';

// Encabezado con degradado oscuro de marca para las pantallas de autenticación.
export function AuthHero() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <BrandGradient style={[styles.hero, { paddingTop: insets.top + SPACING.xxl }]}>
      <View style={styles.brandBadge}>
        <MaterialIcons name="content-cut" size={30} color={colors.primary} />
      </View>
      <Text style={styles.brand}>HAIRCUT FIVE FRIENDS</Text>
      <Text style={styles.tagline}>Tu barbería, en tu bolsillo</Text>
    </BrandGradient>
  );
}

const createStyles = (colors) => StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  brandBadge: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  brand: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.displayBold,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginTop: SPACING.xs,
  },
});
