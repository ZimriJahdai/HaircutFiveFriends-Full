import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { useThemeStore } from '../hooks/useThemeStore';

// Wrapper de TextInput con label, error e icono opcional. Si `secureTextEntry`
// viene en true, agrega un botón de ojo para mostrar/ocultar la contraseña.
export function Input({ label, error, leftIcon, style, secureTextEntry, ...props }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPasswordField = Boolean(secureTextEntry);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused, error && styles.fieldError]}>
        {leftIcon ? (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={focused ? colors.primary : colors.textMuted}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPasswordField && !revealed}
          {...props}
        />
        {isPasswordField ? (
          <Pressable onPress={() => setRevealed((v) => !v)} hitSlop={8} style={styles.revealButton}>
            <MaterialIcons name={revealed ? 'visibility-off' : 'visibility'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    marginBottom: SPACING.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: colors.surfaceAlt,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  fieldError: { borderColor: colors.danger },
  icon: { marginRight: SPACING.sm },
  revealButton: { marginLeft: SPACING.sm },
  input: {
    flex: 1,
    height: '100%',
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.body,
    color: colors.text,
  },
  error: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color: colors.danger,
    marginTop: SPACING.xs,
  },
});
