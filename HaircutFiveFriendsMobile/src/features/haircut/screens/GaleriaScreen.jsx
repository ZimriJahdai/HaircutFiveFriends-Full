import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { useHaircuts } from '../hooks/useHaircuts';
import { Card } from '../../../shared/components';
import { FONTS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../../shared/constants/theme';

export function GaleriaScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { haircuts, loading, error, refetch } = useHaircuts();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estilos</Text>
      <Text style={styles.subtitle}>
        Inspírate con nuestros cortes y selecciona tu próximo estilo.
      </Text>

      {error ? (
        <View style={styles.messageBox}>
          <MaterialIcons name="alert-circle" size={20} color={colors.danger} />
          <Text style={styles.messageText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={haircuts}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="photo" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{loading ? 'Cargando estilos…' : 'No hay estilos disponibles'}</Text>
            <Text style={styles.emptySubtitle}>Intenta recargar o vuelve más tarde.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.imageRef ? (
              <Image source={{ uri: item.imageRef }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="scissors" size={32} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>
              {item.faceTypeRecommended ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {item.faceTypeRecommended === 'CUALQUIERA' ? 'Cualquiera' : item.faceTypeRecommended.charAt(0).toUpperCase() + item.faceTypeRecommended.slice(1).toLowerCase()}
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontFamily: FONTS.displayBold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  list: {
    paddingBottom: SPACING.xxxl,
  },
  card: {
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderRadius: RADIUS.xl,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  cardBody: {
    padding: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.semibold,
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: colors.primaryLight,
  },
  tagText: {
    color: colors.primary,
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semibold,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  messageText: {
    color: colors.danger,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.body,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    color: colors.text,
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.semibold,
  },
  emptySubtitle: {
    marginTop: SPACING.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
});
