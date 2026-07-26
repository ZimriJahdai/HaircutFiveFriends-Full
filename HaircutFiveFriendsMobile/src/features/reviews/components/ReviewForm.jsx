import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Input, Selector, StarRating } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { useBarbers } from '../../barbers/hooks/useBarbers';
import { useServices } from '../../services/hooks/useServices';

const TARGET_OPTIONS = [
  { value: 'barbero', label: 'Barbero' },
  { value: 'servicio', label: 'Servicio' },
];

// El backend exige barberoId XOR servicioName (nunca ambos), score 1-5 y
// comment de 10 a 500 caracteres — validado aquí para feedback inmediato.
export function ReviewForm({ onSubmit, submitting, onCancel }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { barbers } = useBarbers();
  const { services } = useServices();
  const [targetType, setTargetType] = useState('barbero');
  const [targetId, setTargetId] = useState(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const options =
    targetType === 'barbero'
      ? barbers.map((barber) => ({ value: getId(barber), label: barber.name }))
      : services.map((service) => ({ value: service.name, label: service.name }));

  const trimmedComment = comment.trim();
  const canSubmit = Boolean(targetId) && score > 0 && trimmedComment.length >= 10 && trimmedComment.length <= 500;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload =
      targetType === 'barbero'
        ? { barberoId: targetId, score, comment: trimmedComment }
        : { servicioName: targetId, score, comment: trimmedComment };
    onSubmit(payload);
  };

  return (
    <View style={styles.form}>
      <Selector
        label="¿Qué quieres calificar?"
        options={TARGET_OPTIONS}
        value={targetType}
        onChange={(value) => {
          setTargetType(value);
          setTargetId(null);
        }}
      />
      <Selector
        label={targetType === 'barbero' ? 'Barbero' : 'Servicio'}
        options={options}
        value={targetId}
        onChange={setTargetId}
        horizontal={false}
      />

      <View style={styles.ratingRow}>
        <Text style={styles.label}>Calificación</Text>
        <StarRating value={score} onChange={setScore} size={28} />
      </View>

      <Input
        label="Comentario (10-500 caracteres)"
        value={comment}
        onChangeText={setComment}
        multiline
        placeholder="Cuéntanos tu experiencia..."
      />

      <View style={styles.actions}>
        <Button title="Cancelar" variant="ghost" onPress={onCancel} style={styles.actionButton} />
        <Button title="Publicar" gradient onPress={handleSubmit} loading={submitting} disabled={!canSubmit} style={styles.actionButton} />
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  form: { gap: SPACING.sm },
  label: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: SPACING.sm,
  },
  ratingRow: { marginBottom: SPACING.md },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionButton: { flex: 1 },
});
