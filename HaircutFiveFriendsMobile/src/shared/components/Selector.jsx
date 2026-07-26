import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { useThemeStore } from '../hooks/useThemeStore';

// Selector de chips horizontal para opciones [{ value, label }].
export function Selector({ label, options = [], value, onChange, horizontal = true }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const Container = horizontal ? ScrollView : View;
  const containerProps = horizontal
    ? { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.row }
    : { style: styles.column };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Container {...containerProps}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <TouchableOpacity
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Container>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: { marginBottom: SPACING.lg },
  label: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: SPACING.sm,
  },
  row: { gap: SPACING.sm, paddingRight: SPACING.sm },
  column: { gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.semibold, fontWeight: '600', color: colors.textSecondary },
  chipTextSelected: { color: colors.textOnPrimary },
});
