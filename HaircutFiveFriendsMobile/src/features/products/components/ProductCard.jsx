import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Badge, Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { formatCurrency } from '../../../shared/utils/format';
import { FavoriteButton } from '../../favorites/components';

export function ProductCard({ product, onPress, isFavorite, onToggleFavorite }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.card}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="shopping-bag" size={24} color={colors.primary} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.pointsPrice ? <Badge label={`${product.pointsPrice} pts`} tone="warning" /> : null}
          </View>
          <Text style={styles.stock}>{product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}</Text>
        </View>

        {onToggleFavorite ? <FavoriteButton active={isFavorite} onToggle={onToggleFavorite} size={20} /> : null}
      </Card>
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { flexDirection: 'row', gap: SPACING.md },
  image: { width: 56, height: 56, borderRadius: RADIUS.md },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 2 },
  price: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bold, fontWeight: '700', color: colors.text },
  stock: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: colors.textMuted, marginTop: 2 },
});
