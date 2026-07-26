import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FONTS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useThemeStore } from '../hooks/useThemeStore';

// Spinner centrado a pantalla completa.
export function LoadingSpinner({ message }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.muted}>{message}</Text> : null}
    </View>
  );
}

// Estado vacío para listas (icono en círculo tintado).
export function EmptyState({ icon = 'inbox', title = 'Sin datos', message }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.muted}>{message}</Text> : null}
    </View>
  );
}

// Tarjeta contenedora con sombra suave.
export function Card({ children, style }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  return <View style={[styles.card, style]}>{children}</View>;
}

// Píldora de estado con color semántico (fondo tintado + texto + borde).
export function Badge({ label, tone = 'info' }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const palette = getTones(colors)[tone] || getTones(colors).info;
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.badgeText, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

// Calificación por estrellas. `onChange` presente => interactiva (formulario
// de reseña); ausente => solo lectura (tarjetas de barbero/reseña).
export function StarRating({ value = 0, onChange, size = 22 }) {
  const { colors } = useThemeStore();
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <View style={styles.starsRow}>
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        const icon = filled ? 'star' : 'star-border';
        if (!interactive) {
          return <MaterialIcons key={star} name={icon} size={size} color={colors.star} />;
        }
        return (
          <TouchableOpacity key={star} onPress={() => onChange(star)} hitSlop={6}>
            <MaterialIcons name={icon} size={size} color={colors.star} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getTones = (colors) => ({
  success: { bg: colors.successBg, text: colors.success, border: colors.successBorder },
  danger: { bg: colors.dangerBg, text: colors.danger, border: colors.dangerBorder },
  warning: { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder },
  info: { bg: colors.infoBg, text: colors.info, border: colors.infoBorder },
  neutral: { bg: colors.neutralBg, text: colors.neutral, border: colors.neutralBorder },
});

const styles = StyleSheet.create({
  starsRow: { flexDirection: 'row', gap: 2 },
});

const createStyles = (colors) => StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: colors.background,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.displayBold,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
