import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button, Input, StarRating } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';

// El backend solo permite editar `score`/`comment` de una reseña propia.
export function EditReviewModal({ review, onSave, onClose, saving }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const [score, setScore] = useState(review?.score || 0);
  const [comment, setComment] = useState(review?.comment || '');

  if (!review) return null;

  const trimmedComment = comment.trim();
  const canSave = score > 0 && trimmedComment.length >= 10 && trimmedComment.length <= 500;

  return (
    <Modal visible={Boolean(review)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar reseña</Text>
          <StarRating value={score} onChange={setScore} size={28} />
          <Input label="Comentario" value={comment} onChangeText={setComment} multiline />
          <View style={styles.actions}>
            <Button title="Cancelar" variant="ghost" onPress={onClose} style={styles.actionButton} />
            <Button
              title="Guardar"
              gradient
              onPress={() => onSave({ score, comment: trimmedComment })}
              loading={saving}
              disabled={!canSave}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  card: { width: '100%', backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, gap: SPACING.sm },
  title: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionButton: { flex: 1 },
});
