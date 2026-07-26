import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';
import { useThemeStore } from '../hooks/useThemeStore';
import { formatDateTime } from '../utils/format';

// Selector de fecha+hora nativo. `value`/`onChange` trabajan con objetos Date
// (no strings), para que el caller decida cómo serializar hacia el backend.
// En Android se encadenan dos diálogos nativos (fecha -> hora); en iOS se usa
// un solo spinner con mode="datetime".
export function DateField({ label, error, leftIcon = 'event', value, onChange, placeholder, minimumDate }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const [showIOS, setShowIOS] = useState(false);

  const selectedDate = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();

  const openAndroid = () => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      mode: 'date',
      minimumDate,
      onChange: (event, pickedDate) => {
        if (event.type === 'dismissed' || !pickedDate) return;
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          onChange: (timeEvent, pickedTime) => {
            if (timeEvent.type === 'dismissed' || !pickedTime) return;
            const merged = new Date(pickedDate);
            merged.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
            onChange(merged);
          },
        });
      },
    });
  };

  const handlePickIOS = (event, date) => {
    if (event?.type === 'dismissed' || !date) {
      setShowIOS(false);
      return;
    }
    onChange(date);
  };

  const open = () => {
    if (Platform.OS === 'android') {
      openAndroid();
    } else {
      setShowIOS(true);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={open} style={[styles.field, error && styles.fieldError]}>
        <MaterialIcons name={leftIcon} size={20} color={colors.textMuted} style={styles.icon} />
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDateTime(value) : placeholder || 'Selecciona fecha y hora'}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {Platform.OS === 'ios' && showIOS ? (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display="spinner"
          minimumDate={minimumDate}
          onChange={handlePickIOS}
        />
      ) : null}
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
  fieldError: { borderColor: colors.danger },
  icon: { marginRight: SPACING.sm },
  value: { fontSize: FONT_SIZE.md, fontFamily: FONTS.body, color: colors.text },
  placeholder: { fontSize: FONT_SIZE.md, fontFamily: FONTS.body, color: colors.textMuted },
  error: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
    color: colors.danger,
    marginTop: SPACING.xs,
  },
});
