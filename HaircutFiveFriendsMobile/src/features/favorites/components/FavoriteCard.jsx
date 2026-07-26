import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Badge, Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { FAVORITE_TYPE_OPTIONS } from '../../../shared/constants';
import { FavoriteButton } from './FavoriteButton';

const TYPE_LABEL = Object.fromEntries(FAVORITE_TYPE_OPTIONS.map((opt) => [opt.value, opt.label.replace(/s$/, '')]));
const TYPE_ICON = { BARBER: 'content-cut', SERVICE: 'design-services', PRODUCT: 'shopping-bag', HAIRCUT: 'face' };

// `referenceId` viene populado con el documento completo (Barber/Service/
// Product/Haircut) — cada uno tiene su propio campo de imagen (profilePicture/image).
export function FavoriteCard({ favorite, onRemove, removing }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const entity = favorite.referenceId || {};
  const image = entity.profilePicture || entity.image;

  return (
    <Card style={styles.card}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name={TYPE_ICON[favorite.typeFavorite] || 'star'} size={22} color={colors.primary} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {entity.name || 'Elemento eliminado'}
        </Text>
        <Badge label={TYPE_LABEL[favorite.typeFavorite] || favorite.typeFavorite} tone="info" />
      </View>

      <FavoriteButton active onToggle={onRemove} loading={removing} />
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  image: { width: 44, height: 44, borderRadius: RADIUS.md },
  imagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: SPACING.xs },
  name: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, fontWeight: '700', color: colors.text },
});
