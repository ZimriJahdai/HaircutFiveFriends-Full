import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Badge, Button } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { formatCurrency } from '../../../shared/utils/format';

// Detalle armado del item ya cargado en la lista: GET /products/:id es
// ADMIN/EMPLOYEE-only y devuelve 403 para USER_ROLE.
export function ProductDetailModal({ product, onClose, onAddToCart, adding }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  if (!product) return null;

  return (
    <Modal visible={Boolean(product)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="shopping-bag" size={32} color={colors.primary} />
            </View>
          )}

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.pointsPrice ? <Badge label={`${product.pointsPrice} pts`} tone="warning" /> : null}
          </View>
          <Text style={styles.stock}>{product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}</Text>

          {onAddToCart && product.stock > 0 ? (
            <Button
              title={`Agregar al carrito — ${formatCurrency(product.price)}`}
              gradient
              onPress={onAddToCart}
              loading={adding}
            />
          ) : null}
          <Button title="Cerrar" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  image: { width: '100%', height: 160, borderRadius: RADIUS.lg, marginBottom: SPACING.sm },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  name: { fontSize: FONT_SIZE.xl, fontFamily: FONTS.displayBold, fontWeight: '700', color: colors.text },
  description: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  price: { fontSize: FONT_SIZE.lg, fontFamily: FONTS.bold, fontWeight: '700', color: colors.text },
  stock: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: colors.textMuted, marginBottom: SPACING.sm },
});
