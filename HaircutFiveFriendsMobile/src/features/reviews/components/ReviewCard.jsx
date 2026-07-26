import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, StarRating } from '../../../shared/components';
import { FONTS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { formatDate } from '../../../shared/utils/format';

export function ReviewCard({ review, isMine, onEdit, onDelete }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const target = review.barberoId?.name || review.servicioId?.name || 'General';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.author}>{review.clienteId?.name || 'Cliente'}</Text>
        <StarRating value={review.score} size={16} />
      </View>
      <Text style={styles.target}>{target}</Text>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.date}>{formatDate(review.createdAt)}</Text>

      {isMine ? (
        <View style={styles.actions}>
          <Button title="Editar" variant="secondary" onPress={onEdit} style={styles.actionButton} />
          <Button title="Eliminar" variant="danger" onPress={onDelete} style={styles.actionButton} />
        </View>
      ) : null}
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { gap: SPACING.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  author: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, fontWeight: '700', color: colors.text },
  target: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.medium, color: colors.primary },
  comment: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: colors.textMuted, marginTop: SPACING.xs },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionButton: { flex: 1 },
});
