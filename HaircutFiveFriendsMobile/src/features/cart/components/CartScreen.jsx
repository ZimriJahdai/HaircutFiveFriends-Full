import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useCartStore } from '../../../shared/store/cartStore';
import { Button, EmptyState } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { formatCurrency } from '../../../shared/utils/format';
import { useSales } from '../../sales/hooks/useSales';
import { notify } from '../../../shared/utils/confirm';

export function CartScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const createSale = useSales().createSale;
  const [loadingPayment, setLoadingPayment] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    const details = items.map((item) => ({
      referenceId: item.id,
      detailType: item.type,
      quantity: item.quantity,
    }));

    setLoadingPayment(true);
    const result = await createSale(details);
    setLoadingPayment(false);

    if (!result.ok) {
      notify('Error', result.error);
      return;
    }

    clearCart();
    notify('Compra completada', 'Tu factura se generó correctamente. Revisa el historial en Facturas.');
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="shopping-cart"
          title="Carrito vacío"
          message="Agrega productos al carrito para verlos aquí."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </View>
            <View style={styles.quantityRow}>
              <Button
                title="-"
                variant="secondary"
                onPress={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={styles.quantityButton}
              />
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <Button
                title="+"
                variant="secondary"
                onPress={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                style={styles.quantityButton}
              />
            </View>
            <View style={styles.itemFooter}>
              <Text style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
              <Button
                title="Quitar"
                variant="ghost"
                onPress={() => removeItem(item.id, item.type)}
                style={styles.removeButton}
              />
            </View>
          </View>
        )}
      />

      <View style={styles.checkoutCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
        </View>
        <View style={styles.actions}> 
          <Button title="Vaciar carrito" variant="ghost" onPress={clearCart} style={styles.actionButton} />
          <Button title="Pagar" gradient onPress={handleCheckout} loading={loadingPayment} style={styles.actionButton} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  list: { padding: SPACING.lg },
  itemCard: { backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: colors.border },
  itemInfo: { marginBottom: SPACING.sm },
  itemName: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, color: colors.text },
  itemPrice: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textMuted, marginTop: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  quantityButton: { width: 40, height: 40, borderRadius: RADIUS.md, paddingHorizontal: 0 },
  quantityValue: { width: 32, textAlign: 'center', fontSize: FONT_SIZE.lg, fontFamily: FONTS.bold, color: colors.text },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTotal: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bold, color: colors.text },
  removeButton: { paddingHorizontal: 0 },
  checkoutCard: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, padding: SPACING.lg },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  totalLabel: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, color: colors.textMuted },
  totalValue: { fontSize: FONT_SIZE.xl, fontFamily: FONTS.displayBold, color: colors.text },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: { flex: 1 },
});
