import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Button, Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { pickProfileImage } from '../../../shared/utils/imagePicker';

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Corto' },
  { value: 'medium', label: 'Medio' },
  { value: 'long', label: 'Largo' },
];

const STYLE_OPTIONS = [
  { value: 'classic', label: 'Clásico' },
  { value: 'modern', label: 'Moderno' },
  { value: 'urban', label: 'Urbano' },
];

export function ProbarCorteScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  const [photoUri, setPhotoUri] = useState(null);
  const [length, setLength] = useState('');
  const [style, setStyle] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    const result = await pickProfileImage();
    if (result?.canceled) {
      return;
    }
    if (result?.error) {
      Alert.alert('Permiso requerido', result.error);
      return;
    }

    setPhotoUri(result?.uri || null);
    setAnalysis(null);
  };

  const handleGenerate = () => {
    if (!photoUri) {
      Alert.alert('Falta una foto', 'Sube una foto antes de generar el corte.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const selectedLength = LENGTH_OPTIONS.find((option) => option.value === length);
      const selectedStyle = STYLE_OPTIONS.find((option) => option.value === style);
      setAnalysis({
        faceShape: 'Ovalado',
        hairTexture: 'Media',
        hairColor: 'Oscuro',
        recommendedHaircutStyle: selectedStyle?.label || 'Clásico',
        lengthLabel: selectedLength?.label || 'Cualquiera',
      });
      setLoading(false);
    }, 700);
  };

  const handleClear = () => {
    setPhotoUri(null);
    setLength('');
    setStyle('');
    setAnalysis(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Probar corte en vivo</Text>
      <Text style={styles.subtitle}>
        Sube una foto, genera un corte recomendado y pruébalo con una vista previa visual.
      </Text>

      <Card style={styles.uploadCard}>
        <Pressable onPress={handlePickPhoto} style={styles.uploadButton}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.placeholderBox}>
              <MaterialIcons name="add-a-photo" size={34} color={colors.primary} />
              <Text style={styles.uploadTitle}>Sube una foto tuya</Text>
              <Text style={styles.uploadHint}>Buena luz y mirando al frente</Text>
            </View>
          )}
        </Pressable>
      </Card>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Largo</Text>
        <View style={styles.optionRow}>
          {LENGTH_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setLength(option.value)}
              style={[styles.optionChip, length === option.value && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, length === option.value && styles.optionTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Estilo</Text>
        <View style={styles.optionRow}>
          {STYLE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setStyle(option.value)}
              style={[styles.optionChip, style === option.value && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, style === option.value && styles.optionTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title={loading ? 'Analizando…' : 'Generar corte'}
          onPress={handleGenerate}
          gradient
          loading={loading}
          disabled={!photoUri}
          style={styles.primaryAction}
        />
        <Button title="Limpiar" onPress={handleClear} variant="secondary" style={styles.secondaryAction} />
      </View>

      {analysis ? (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>Resumen del análisis</Text>
          <Text style={styles.resultText}>Rostro: {analysis.faceShape}</Text>
          <Text style={styles.resultText}>Textura: {analysis.hairTexture}</Text>
          <Text style={styles.resultText}>Color: {analysis.hairColor}</Text>
          <Text style={styles.resultText}>Sugerido: {analysis.recommendedHaircutStyle}</Text>
          <Text style={styles.resultText}>Largo: {analysis.lengthLabel}</Text>
        </Card>
      ) : null}

      <Card style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Vista previa del corte</Text>
          <MaterialIcons name="visibility" size={20} color={colors.primary} />
        </View>
        <View style={styles.previewBox}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImageBox} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <MaterialIcons name="face-retouching-natural" size={40} color={colors.primary} />
              <Text style={styles.previewPlaceholderText}>Tu resultado aparecerá aquí</Text>
            </View>
          )}
        </View>
      </Card>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
    title: {
      fontSize: FONT_SIZE.xxl,
      fontFamily: FONTS.displayBold,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    subtitle: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: SPACING.lg,
    },
    uploadCard: { padding: SPACING.sm, borderRadius: RADIUS.xl, backgroundColor: colors.surface, ...SHADOWS.subtle },
    uploadButton: {
      minHeight: 220,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderStrong,
      overflow: 'hidden',
    },
    placeholderBox: {
      flex: 1,
      minHeight: 220,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg,
      backgroundColor: colors.surfaceAlt,
    },
    photoPreview: { width: '100%', height: 220, resizeMode: 'cover' },
    uploadTitle: {
      fontSize: FONT_SIZE.lg,
      fontFamily: FONTS.semibold,
      color: colors.text,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    uploadHint: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    group: { marginTop: SPACING.lg },
    groupTitle: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.semibold,
      color: colors.textMuted,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    optionRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
    optionChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.surfaceAlt,
    },
    optionChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    optionText: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
    },
    optionTextActive: { color: colors.primary, fontWeight: '700' },
    actions: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.lg,
      flexWrap: 'wrap',
    },
    primaryAction: { flex: 1, minWidth: 180 },
    secondaryAction: { minWidth: 120 },
    resultCard: {
      marginTop: SPACING.lg,
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.surface,
      gap: SPACING.xs,
    },
    resultTitle: {
      fontSize: FONT_SIZE.md,
      fontFamily: FONTS.semibold,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    resultText: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    previewCard: {
      marginTop: SPACING.lg,
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.surface,
      gap: SPACING.md,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    previewTitle: {
      fontSize: FONT_SIZE.md,
      fontFamily: FONTS.semibold,
      color: colors.text,
    },
    previewBox: {
      minHeight: 220,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewImageBox: { width: '100%', height: 220, resizeMode: 'cover' },
    previewPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg,
      gap: SPACING.sm,
    },
    previewPlaceholderText: {
      fontSize: FONT_SIZE.sm,
      fontFamily: FONTS.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
