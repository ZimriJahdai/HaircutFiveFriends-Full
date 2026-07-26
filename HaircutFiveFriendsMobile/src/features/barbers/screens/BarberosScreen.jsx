import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, LoadingSpinner } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { FAVORITE_TYPES } from '../../../shared/constants';
import { notify } from '../../../shared/utils/confirm';
import { useFavorites } from '../../favorites/hooks/useFavorites';
import { BarberCard, BarberSearch } from '../components';
import { useBarbers } from '../hooks/useBarbers';

export function BarberosScreen() {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { barbers, ratings, loading, error, search, setSearch, refetch } = useBarbers();
  const { isFavorite, toggleFavorite } = useFavorites();

  const onToggleFavorite = async (barberId) => {
    const result = await toggleFavorite(FAVORITE_TYPES.BARBER, barberId);
    if (!result.ok) notify('Error', result.error);
  };

  if (loading && barbers.length === 0) return <LoadingSpinner message="Cargando barberos..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={barbers}
        keyExtractor={(item) => String(getId(item))}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <BarberSearch value={search} onChangeText={setSearch} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="content-cut" title="Sin barberos" message={error || 'No encontramos barberos disponibles.'} />
        }
        renderItem={({ item }) => (
          <BarberCard
            barber={item}
            rating={ratings[getId(item)]}
            isFavorite={isFavorite(FAVORITE_TYPES.BARBER, getId(item))}
            onToggleFavorite={() => onToggleFavorite(getId(item))}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: SPACING.lg },
  header: { marginBottom: SPACING.sm },
});
