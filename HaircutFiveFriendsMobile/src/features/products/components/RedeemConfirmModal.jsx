import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';

export function RedeemConfirmModal({ product, points, onConfirm, onClose, redeeming }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  if (!product) return null;
  const canAfford = points >= (product.pointsPrice || 0);

  return (
    <Modal visible={Boolean(product)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Canjear {product.name}</Text>
          <Text style={styles.message}>
            Esto usará {product.pointsPrice} de tus {points} puntos.
          </Text>
          {!canAfford ? <Text style={styles.warning}>No tienes suficientes puntos para este canje.</Text> : null}
          <View style={styles.actions}>
            <Button title="Cancelar" variant="ghost" onPress={onClose} style={styles.actionButton} />
            <Button
              title="Confirmar canje"
              gradient
              onPress={onConfirm}
              loading={redeeming}
              disabled={!canAfford}
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
  message: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary },
  warning: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.medium, color: colors.danger },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  actionButton: { flex: 1 },
});
