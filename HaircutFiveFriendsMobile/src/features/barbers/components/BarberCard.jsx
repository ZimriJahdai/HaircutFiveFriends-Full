import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Badge, Card, StarRating } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { FavoriteButton } from '../../favorites/components';

export function BarberCard({ barber, rating, isFavorite, onToggleFavorite }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const schedule = Array.isArray(barber.schedule) ? barber.schedule : [];

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {barber.profilePicture ? (
          <Image source={{ uri: barber.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="content-cut" size={22} color={colors.primary} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{barber.name}</Text>
          <View style={styles.ratingRow}>
            <StarRating value={rating?.averageScore || 0} size={14} />
            <Text style={styles.ratingText}>
              {rating ? `${rating.averageScore.toFixed(1)} (${rating.totalReviews})` : 'Sin reseñas'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Badge label={barber.status ? 'Disponible' : 'No disponible'} tone={barber.status ? 'success' : 'neutral'} />
          {onToggleFavorite ? <FavoriteButton active={isFavorite} onToggle={onToggleFavorite} size={20} /> : null}
        </View>
      </View>

      {schedule.length > 0 ? (
        <View style={styles.scheduleBox}>
          {schedule.map((slot, index) => (
            <Text key={index} style={styles.scheduleText}>
              {slot.days}: {slot.hours}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: { width: 52, height: 52, borderRadius: RADIUS.pill },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  actions: { alignItems: 'flex-end', gap: SPACING.xs },
  name: { fontSize: FONT_SIZE.md, fontFamily: FONTS.semibold, fontWeight: '700', color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  ratingText: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: colors.textMuted },
  scheduleBox: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: SPACING.sm, gap: 2 },
  scheduleText: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.body, color: colors.textSecondary },
});
