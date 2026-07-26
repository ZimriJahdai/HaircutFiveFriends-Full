import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, LoadingSpinner, Selector } from '../../../shared/components';
import { SPACING } from '../../../shared/constants/theme';
import { useThemeStore } from '../../../shared/hooks/useThemeStore';
import { getId } from '../../../shared/api';
import { FAVORITE_TYPES } from '../../../shared/constants';
import { notify } from '../../../shared/utils/confirm';
import { useFavorites } from '../../favorites/hooks/useFavorites';
import { ServiceCard, ServiceSearch } from '../components';
import { useServices } from '../hooks/useServices';

const CATALOG_TABS = [
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Productos', label: 'Productos' },
];

export function ServiciosScreen({ navigation }) {
  const { colors } = useThemeStore();
  const styles = createStyles(colors);
  const { services, loading, error, search, setSearch, refetch } = useServices();
  const { isFavorite, toggleFavorite } = useFavorites();

  const onToggleFavorite = async (serviceId) => {
    const result = await toggleFavorite(FAVORITE_TYPES.SERVICE, serviceId);
    if (!result.ok) notify('Error', result.error);
  };

  if (loading && services.length === 0) return <LoadingSpinner message="Cargando servicios..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => String(getId(item))}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Selector options={CATALOG_TABS} value="Servicios" onChange={(routeName) => navigation.navigate(routeName)} />
            <ServiceSearch value={search} onChangeText={setSearch} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="content-cut" title="Sin servicios" message={error || 'No hay servicios disponibles.'} />
        }
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            isFavorite={isFavorite(FAVORITE_TYPES.SERVICE, getId(item))}
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
