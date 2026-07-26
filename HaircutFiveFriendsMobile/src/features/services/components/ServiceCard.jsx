import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { FavoriteButton } from '../../favorites/components';

const CATEGORY_LABELS = {
  CORTE_DE_CABELLO: 'Corte de cabello',
  AFEITADO: 'Afeitado',
  RECORTES_DE_BARBA: 'Recorte de barba',
  ARREGLO_DE_CABELLO: 'Arreglo de cabello',
  TRATAMIENTOS_CAPILARES: 'Tratamiento capilar',
  TRATAMIENTOS_FACIALES: 'Tratamiento facial',
};

// `service.price` ya viene formateado como "Q45.00" por el toJSON del backend.
export function ServiceCard({ service, isFavorite, onToggleFavorite }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);

  return (
    <Card style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="content-cut" size={22} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[service.category] || service.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>{service.price}</Text>
          <Text style={styles.duration}>{service.duration}</Text>
          {service.pointsPrice ? <Text style={styles.points}>{service.pointsPrice} pts</Text> : null}
        </View>
      </View>
      {onToggleFavorite ? <FavoriteButton active={isFavorite} onToggle={onToggleFavorite} size={20} /> : null}
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { flexDirection: 'row', gap: SPACING.md },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, fontWeight: '700', color: colors.text },
  category: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.medium, color: colors.primary },
  description: { fontSize: FONT_SIZE.sm, fontFamily: FONTS.body, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xs },
  price: { fontSize: FONT_SIZE.md, fontFamily: FONTS.bold, fontWeight: '700', color: colors.text },
  duration: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: colors.textMuted },
  points: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.semibold, fontWeight: '600', color: colors.secondary },
});
