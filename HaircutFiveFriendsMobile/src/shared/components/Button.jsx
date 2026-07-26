import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FONTS, FONT_SIZE, GRADIENTS, RADIUS, SPACING } from '../constants/theme';
import { useThemeStore } from '../hooks/useThemeStore';

// Botón reutilizable.
//  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
//  gradient: true → CTA con degradado de acento (solo variant primary)
export function Button({
  title,
  onPress,
  variant = 'primary',
  gradient = false,
  loading = false,
  disabled = false,
  style,
  ...props
}) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const isDisabled = disabled || loading;
  const variants = getVariants(colors);
  const palette = variants[variant] || variants.primary;
  const useGradient = gradient && variant === 'primary' && !isDisabled;

  const content = loading ? (
    <ActivityIndicator color={palette.text} />
  ) : (
    <Text style={[styles.label, { color: palette.text }]}>{title}</Text>
  );

  if (useGradient) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [styles.shadowPrimary, pressed && styles.pressed, style]}
        {...props}
      >
        <LinearGradient
          colors={GRADIENTS.accent}
          start={GRADIENTS.start}
          end={GRADIENTS.endHorizontal}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        variant === 'primary' && !isDisabled && styles.shadowPrimary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {content}
    </Pressable>
  );
}

const getVariants = (colors) => ({
  primary: { bg: colors.primary, border: colors.primary, text: colors.textOnPrimary },
  secondary: { bg: colors.surfaceAlt, border: colors.border, text: colors.primary },
  ghost: { bg: colors.transparent, border: colors.transparent, text: colors.primary },
  danger: { bg: colors.danger, border: colors.danger, text: colors.white },
});

const BASE = {
  height: 52,
  borderRadius: RADIUS.md,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: SPACING.lg,
};

const createStyles = (colors) => StyleSheet.create({
  base: { ...BASE, borderWidth: 1 },
  gradient: { ...BASE },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  shadowPrimary: {
    borderRadius: RADIUS.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
